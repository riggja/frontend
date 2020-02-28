import {Component, NgModule, OnInit} from '@angular/core';
import {ActivatedRoute, Router } from '@angular/router';
import { FileSelectDirective, FileDropDirective, FileUploader } from 'ng2-file-upload/ng2-file-upload';

import { RequestService } from '../../../shared-ng/services/request.service';

import {environment} from '../../../shared-ng/environments/environment';
import { AuthService, HermesService } from '../../../shared-ng/services/services';
import { AnswerObject, ApplicationPOST, JobView, ApplicationView, User } from 'src/shared-ng/interfaces/interfaces';
import { Subscription } from 'rxjs';


@Component({
  selector: 'submit',
  templateUrl: 'submit.component.html',
  providers: [ RequestService ]
})

export class SubmitComponent implements OnInit {
  form: JobView;
  gForm: JobView;
  app: ApplicationView;
  gApp: ApplicationView;
  answers: AnswerObject[] = [];
  gAnswers: AnswerObject[] = [];
  formID: number;
  currentUser: User;
  submitText = 'Submit';
  file: any;
  public uploader: FileUploader = new FileUploader({url: environment.SERVER_URL + '/forms/resume/upload'});
  buildLoginLink: () => string;
  userInfoSubscription: Subscription;

  constructor(private route: ActivatedRoute, private rs: RequestService,
              private as: AuthService, private router: Router, private hermesService: HermesService) {
  }

  ngOnInit() {
    this.buildLoginLink = this.as.buildLoginLink;
    this.formID = this.route.snapshot.params.formID;
    this.userInfoSubscription = this.as.getUserInfo().subscribe((data: User) => {
      if (this.currentUser == null && data) {
        // this will get called when the component loads the first time, and
        // any time the user data goes from null to defined, but not times
        // when user data is only mutated.
        this.getJobData(data);
      }
      this.currentUser = data;
    });
  }

  getJobData(userData: User) {
    if (userData) {
      this.rs.get('/forms/job/view/1').subscribe((data) => {
        this.gForm = data.form;
        // GET request to retrieve previous application answers
        this.rs.get('/forms/application/view/1/' + this.currentUser.username).subscribe((data) => {
          this.gApp = data.application;
          if (data.status === 'Application not found' || this.gApp.answers.length === 0) {
            // build the empty answers array
            this.gForm.questions.forEach((entry) => {
              const answerObj = {
                questionID: entry.id,
                answer: ''
              };
              this.gAnswers.push(answerObj);
            });
          } else {
            this.gApp.answers.forEach((entry) => {
              const answerObj = {
                questionID: entry.questionID,
                answer: entry.answer
              };
              this.gAnswers.push(answerObj);
            });
          }
        }, (err) => {
          this.gForm.questions.forEach((entry) => {
            const answerObj = {
              questionID: entry.id,
              answer: ''
            };
            this.gAnswers.push(answerObj);
          });
        });
      }, undefined);

      this.rs.get('/forms/job/view/' + this.formID).subscribe((data: {form: JobView}) => {
        this.form = data.form;
        // GET request to retrieve previous application answers
        this.hermesService.sendHeaderTitle(this.form.job_name);
        this.rs.get('/forms/application/view/' + this.formID + '/' + this.currentUser.username).subscribe((data: {application: ApplicationView}) => {
          this.app = data.application;
          if (this.app.answers.length === 0) {
            // build the empty answers array
            this.form.questions.forEach((entry) => {
              const answerObj = {
                questionID: entry.id,
                answer: ''
              };
              this.answers.push(answerObj);
            });
          } else {
            this.app.answers.forEach((entry) => {
              const answerObj = {
                questionID: entry.questionID,
                answer: entry.answer
              };
              this.answers.push(answerObj);
            });
          }
        }, (err) => {
          this.form.questions.forEach((entry) => {
            const answerObj = {
              questionID: entry.id,
              answer: ''
            };
            this.answers.push(answerObj);
          });
        });
      }, undefined);
    }
  }

  navigateToDone(formID: number) {
    this.router.navigateByUrl('/done/' + this.formID);
  }

  onSubmit() {
    this.submitText = 'Submitting...';
    const submission: ApplicationPOST = { jobID: this.formID, username: this.currentUser.username, answers: this.answers};
    const gSubmission: ApplicationPOST = { jobID: 1, username: this.currentUser.username, answers: this.gAnswers};
    this.rs.post('/forms/application/submit', gSubmission, null, 'urlencoded').subscribe((data) => {
      try {
        if (!data.error) {
          this.rs.post('/forms/application/submit', submission, null, 'urlencoded').subscribe((data) => {
            try {
              if (data.error) {
                console.log('(a) Error:', data.error);
                window.alert('Error: ' + data.error);
                this.submitText = 'Submit';
              } else if (data.status === 'submitted') {
                // File Upload
                if (this.uploader.getNotUploadedItems().length > 0) {
                  this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
                    console.log('ImageUpload:uploaded:', item, status);
                    if (status < 200 || status > 299) {
                      console.log('(b) Error: ', JSON.parse(response).message);
                      alert(JSON.parse(response).message);
                      this.submitText = 'Submit';
                    } else {
                      this.navigateToDone(this.formID);
                    }
                  };
                  this.uploader.onBuildItemForm = (item, form) => {
                    form.append('jobID', this.formID);
                    item.withCredentials = false;
                  };
                  this.uploader.uploadAll();
                } else {
                  this.navigateToDone(this.formID);
                }
              } else {
                console.log('form status: ', data.status);
                window.alert('form status: ' + data.status);
                this.submitText = 'Submit';
              }
            } catch (err) {
              console.log('(c) Error: ', err);
              window.alert(err);
              this.submitText = 'Submit';
            }
          }, (error) => { console.log('(d) Error: ', error); window.alert(error); this.submitText = 'Submit'; } );
        }
      } catch (err) {

      }
    }, (error) => { console.log('(e) Error: ', error); window.alert(error); this.submitText = 'Submit'; } );

  }

}

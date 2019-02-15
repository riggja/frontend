import { Component, OnInit } from '@angular/core';
import { RequestService } from '../../../shared-ng/services/request.service';

// election interface
interface Election { 
  id: string, 
  election_type: string, 
  name: string, 
  max_votes: number, 
  start: string, 
  end: string, 
  show_results: string
};
// position interface
interface Position {
  id: string,
  position: string,
  election_type: string,
  active: boolean,
  order: number
}

@Component({
  selector: 'app-vote',
  templateUrl: './vote.component.html',
  styleUrls: ['./vote.component.css']
})
export class VoteComponent implements OnInit {
  election: Election = null;  // the current election
  positions: Position[] = [];  // the positions based on the election type
  public switchState: string = 'loading';  // the switchable state of the view

  constructor(private rs: RequestService) { }

  ngOnInit() {
    // get the current election
    this.rs.get('elections/current').subscribe((electionData) => {
      this.election = electionData;
      // get positions for the election type
      this.rs.get('elections/position', { election_type: this.election.election_type }).subscribe((positionData) => {
        this.positions = positionData.positions;
        this.switchState = 'start';
      }, null);
    }, null);
  }

  // function called when the user presses start
  start() {
    // determine next switch state based on election type
    if (this.election.election_type == 'senate') {
      this.switchState = 'district';
    } else {
      this.switchState = 'vote'
    }
  }

  // function called when the user selects a district in a senate election
  districtSelected(positionIndex: number) {
    let position = this.positions[positionIndex];
    this.switchState = 'vote';
    console.log(position);
  }
}

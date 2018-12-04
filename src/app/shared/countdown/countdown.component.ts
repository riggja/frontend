import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'countdown',
  templateUrl: './countdown.component.html',
  styleUrls: ['./countdown.component.css']
})
export class CountdownComponent implements OnInit {
  dateString: string = "2019-01-01 12:00:00"
  status: string = "upcoming"

  constructor() { }

  ngOnInit() {
    var display = document.querySelector('#time'), date = new Date(this.dateString);
    var difference = Math.abs((Date.now() - date.getTime())/1000);
    this.startTimer(difference, display);
  }

  // Returns string depending on whether the election will be opening or closing in X time
  getStatus() {
    if (this.status == "upcoming") {
      return "opens";
    }
    if (this.status == "now") {
      return "closes"
    }
  }

  // duration = time in seconds, display = id to display to 
  startTimer(duration, display) {
    var timer = duration, days, hours, minutes, seconds;
    setInterval(function () {
        days = Math.floor(timer / 86400);
        hours = Math.floor((timer % 86400) / 3600);
        minutes = Math.floor((timer / 60) % 60);
        seconds = Math.floor(timer % 60);

        days = days < 10 ? "0" + days : days;
        hours = hours < 10 ? "0" + hours : hours;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = days + "d " + hours + "h " + minutes + "m " + seconds + "s";

        if (--timer < 0) {
            timer = duration;
        }
    }, 1000);
}

}

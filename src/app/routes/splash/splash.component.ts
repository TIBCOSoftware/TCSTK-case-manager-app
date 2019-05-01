import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {LandingPageItemConfig} from '@tibco-tcstk/tc-core-lib';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.css']
})
export class SplashComponent implements OnInit {

  title = 'Welcome to your Case Management App';
  subTitle = 'A highly customizable Case Management application to manage Live Apps cases';
  highlights: LandingPageItemConfig[] = [
    new LandingPageItemConfig().deserialize({
      iconURL: 'ic-documentation',
      title: 'Engage',
      content: 'Handle all case related requests in a single place - e.g. create cases, action cases, approve requests.'
    }),
    new LandingPageItemConfig().deserialize({
      iconURL: 'ic-graph',
      title: 'Collaborate',
      content: 'Provide in-depth, real-time visibility into the risk investigation process - e.g. high priority cases; action audit trails, etc.'
    }),
    new LandingPageItemConfig().deserialize({
      iconURL: 'ic-graph',
      title: 'Track',
      content: 'Provide in-depth, real-time visibility into the risk investigation process - e.g. high priority cases; action audit trails, etc.'
    })
  ];

  constructor(private router: Router) {
  }

  public handleGetStarted = (event) => {
    // get started - navigate to home
    this.router.navigate(['/starterApp/home/']);
  }

  ngOnInit() {
  }

}

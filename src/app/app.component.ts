import {Component} from '@angular/core';
import {FirestoreService} from './core/services/firestore.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'uno';

  constructor() {
  }
}

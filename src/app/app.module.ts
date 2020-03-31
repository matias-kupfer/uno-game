import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {HttpClientModule} from '@angular/common/http';
import {AngularFireModule} from '@angular/fire';
import {AngularFirestoreModule} from '@angular/fire/firestore';
import {AngularFireDatabaseModule} from '@angular/fire/database';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CardComponent} from './components/card/card.component';
import {
  MatButtonModule,
  MatIconModule,
  MatInputModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatSliderModule,
  MatSnackBarModule
} from '@angular/material';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {IndexComponent} from './components/index/index.component';
import {LobbyComponent} from './components/lobby/lobby.component';
import {environment} from '../environments/environment';


import * as firebase from 'firebase/app';
import {HashLocationStrategy, Location, LocationStrategy} from '@angular/common';
import { DesignComponent } from './components/design/design.component';


firebase.initializeApp(environment.firebase);

@NgModule({
  declarations: [
    AppComponent,
    CardComponent,
    IndexComponent,
    LobbyComponent,
    DesignComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireDatabaseModule,
    // material
    MatIconModule,
    MatSliderModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatRadioModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule
  ],
  providers: [Location, {provide: LocationStrategy, useClass: HashLocationStrategy}],
  bootstrap: [AppComponent]
})
export class AppModule {
}

import {Component, OnDestroy, OnInit} from '@angular/core';
import {ApiService} from '../../core/services/api.service';
import {MatSnackBar} from '@angular/material';
import {Router} from '@angular/router';
import {ApiResponse} from '../../interfaces';
import {Observable, Subject} from 'rxjs';
import {take, takeUntil} from 'rxjs/operators';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  private gameForm: FormGroup;

  constructor(private apiService: ApiService,
              private snackBar: MatSnackBar,
              private router: Router,
              private formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.gameForm = new FormGroup({
      player: new FormControl(null, [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(15),
      ]),
      gameId: new FormControl(null, [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(20),
      ]),
      gamePassword: new FormControl(null, [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(10),
      ])
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  get player() {
    return this.gameForm.get('player');
  }

  get gameId() {
    return this.gameForm.get('gameId');
  }

  get gamePassword() {
    return this.gameForm.get('gamePassword');
  }

  public createGame() {
    this.apiService.createGame(this.gameId.value, this.gamePassword.value, this.player.value).pipe(
      takeUntil(this.ngUnsubscribe)).subscribe((res: ApiResponse) => {
      if (res.success) {
        this.snackBar.open(res.message, '', {
          duration: 5000
        });
        this.router.navigate(['lobby/' + this.gameId.value + '/' + this.player.value]);
      } else {
        this.snackBar.open(res.message, '', {
          duration: 5000
        });
      }
    });
  }

  public joinGame() {
    this.apiService.joinGame(this.gameId.value, this.gamePassword.value, this.player.value).pipe(
      takeUntil(this.ngUnsubscribe)).subscribe((res: ApiResponse) => {
      if (res.success) {
        this.snackBar.open(res.message, '', {
          duration: 5000
        });
        this.router.navigate(['lobby/' + this.gameId.value + '/' + this.player.value]);
      } else {
        this.snackBar.open(res.message, '', {
          duration: 5000
        });
      }
    });
  }
}

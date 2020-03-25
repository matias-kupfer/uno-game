import {Component, OnDestroy, OnInit} from '@angular/core';
import {ApiService} from '../../core/services/api.service';
import {MatSnackBar} from '@angular/material';
import {Router} from '@angular/router';
import {ApiResponse} from '../../interfaces';
import {Observable, Subject} from 'rxjs';
import {take, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit, OnDestroy {
  public gameId = '2';
  public gamePassword = '1234';
  public player: string;
  private ngUnsubscribe = new Subject();

  constructor(private apiService: ApiService, private snackBar: MatSnackBar, private router: Router) {
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public createGame() {
    this.apiService.createGame(this.gameId, this.gamePassword, this.player).pipe(
      takeUntil(this.ngUnsubscribe)).subscribe((res: ApiResponse) => {
      if (res.success) {
        this.snackBar.open(res.message, '', {
          duration: 5000
        });
        this.router.navigate(['lobby/' + this.gameId + '/' + this.player]);
      } else {
        this.snackBar.open(res.message, '', {
          duration: 5000
        });
      }
    });
  }

  public joinGame() {
    this.apiService.joinGame(this.gameId, this.gamePassword, this.player).pipe(
      takeUntil(this.ngUnsubscribe)).subscribe((res: ApiResponse) => {
      if (res.success) {
        this.snackBar.open(res.message, '', {
          duration: 5000
        });
        this.router.navigate(['lobby/' + this.gameId + '/' + this.player]);
      } else {
        this.snackBar.open(res.message, '', {
          duration: 5000
        });
      }
    });
  }
}

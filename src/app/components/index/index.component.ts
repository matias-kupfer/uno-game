import {Component, NgZone, OnInit} from '@angular/core';
import {ApiService} from '../../core/services/api.service';
import {MatSnackBar} from '@angular/material';
import {Router} from '@angular/router';
import {ApiResponse} from '../../interfaces/api-response';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
  public gameId: string = '2';
  public gamePassword: string = '1234';
  public player: string;

  constructor(private apiService: ApiService, private snackBar: MatSnackBar, private router: Router) {
  }

  ngOnInit() {
  }

  public createGame() {
    this.apiService.createGame(this.gameId, this.gamePassword, this.player).subscribe((res: ApiResponse) => {
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
    this.apiService.joinGame(this.gameId, this.gamePassword, this.player).subscribe((res: ApiResponse) => {
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

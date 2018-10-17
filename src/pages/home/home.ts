import { Component, OnInit } from '@angular/core';
import { AlertController } from 'ionic-angular';

import { HttpClient } from '@angular/common/http';
//import { HttpClientModule } from '@angular/common/http';
import { LoadingController } from 'ionic-angular';

import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  styles: [ ]
})
export class HomePage implements OnInit {

  herokuUrl = 'http://localhost:3000';
  username = '';
  password = '';
  disableSubmitButton = true;
  timer = 0;

  onType() {
    this.disableSubmitButton = this.username === '' || this.password === '';
    //console.log('submit', this.username, this.password)
  }

  postToheroku(timer): Observable<any> {
    const url = `${this.herokuUrl}/users?user=${this.username}&password=${this.password}&timer=${timer}`;
    return this.http.get(url);
  }

  /**
   * A request to verify Credentials
   */
  postToherokuVerify(timer): Observable<any> {
    const url = `${this.herokuUrl}/users/credentials?user=${this.username}&password=${this.password}&timer=${timer}`;
    return this.http.get(url);
  }

  /**
   * Store local data (like username and password)
   */
  store(event) {
    const element = event.srcElement.attributes.id || event.currentTarget.id;
    console.log(element);
    console.log(element, this[ element ]);
    this.storage.set(element, this[ element ]);
  }

  /**
   * Send request to server
   */
  sendRequest() {
    this.postToheroku(this.timer)
      .subscribe(res => {
        console.log(res);
        if (res.status !== 200){
          this.alertError(res.message);
        }
      });
  }


  constructor(private alertCtrl: AlertController, public loadingCtrl: LoadingController, private http: HttpClient, private storage: Storage) {
  }

  presentLoading() {
    const loader = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loader.present();
    return loader;
  }

  alertConfirm(name) {
    let alert = this.alertCtrl.create({
      title: name,
      message: `Slide for ${this.timer} minutes ?`,
      enableBackdropDismiss: false,
      buttons: [ {
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      },
        {
          text: 'Confirm',
          handler: () => {
            console.log('Confirm clicked');

            this.postToheroku(this.timer)
              .subscribe(res => {
                console.log(res);
                if (res.status !== 200){
                  this.alertError(res.message);
                } else {
                  this.alertSuccess();
                }
              });

          }
        } ]
    });
    alert.present();
  }

  alertError(message) {
    let alert = this.alertCtrl.create({
      title: 'Error',
      message: message,
      enableBackdropDismiss: false,
      buttons: [ {
        text: 'OK',
        handler: () => {
          console.log('Confirm clicked');
        }
      } ]
    });
    alert.present();
  }

  checkCredentials() {
    let loadingPopup = this.presentLoading();
    this.postToherokuVerify(this.timer)
      .subscribe(res => {
        let status = res.status;
        // console.log(status);
        // console.log(res);
        loadingPopup.dismiss();
        if (res.status === 200) {
          this.alertConfirm(res.name);
        } else {
          this.alertError(res.message);
        }
      });
  }

  alertSuccess() {
    let alert = this.alertCtrl.create({
      title: 'Request sent !',
      //subTitle: '10% of battery remaining',
      buttons: [ 'Dismiss' ]
    });
    alert.present();
  }

  ngOnInit() {
    //retrieve local data from Storage
    Promise.all([ this.storage.get('username'), this.storage.get('password') ]).then(values => {
      this.username = values[ 0 ];
      this.password = values[ 1 ];
      this.disableSubmitButton = this.username === '' || this.password === '';
    });
  }

}

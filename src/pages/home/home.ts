import { Component, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';

import { HttpClient } from '@angular/common/http';
//import { HttpClientModule } from '@angular/common/http';


import { Observable } from 'rxjs';
import 'rxjs/add/operator/map'
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  styles: ['.tego-green { color: #2ecc71; }',
    '.tego-red { color: #e74c3c; }']
})
export class HomePage implements OnInit {
 
  herokuUrl = "http://localhost:3000";
  username = '';
  password = '';
  disableSubmitButton = false;
  message = '';
  messageColor = '';
  loading = false;
  
   onSubmit() {
    if (this.username !== '' && this.password !== '') {
      this.disableSubmitButton = true;
      setTimeout(() => { this.disableSubmitButton = false }, 3000)
    }
    this.loading = true;
    this.message = '';
    this.sendRequest();
    //console.log('submit', this.username, this.password)
  }

  postToheroku(): Observable<any> {
    const url = `${this.herokuUrl}/users?user=${this.username}&password=${this.password}`;
    return this.http.get(url);
  }

  /**
   * Set callback message color
   */
  setMessageColor(code) {
    if (code === 200) {
      this.messageColor = 'tego-green';
    } else {
      this.messageColor = 'tego-red';
    }
  }

  /**
   * Store local data (like username and password)
   */
  store(event) {
    //console.log(event.target.name, this[event.target.name])
    this.storage.set(event.target.name, this[event.target.name]);
  }

  /**
   * Send request to server
   */
  sendRequest() {
    this.postToheroku()
      .subscribe(res => {
        this.loading = false;
        this.message = res.message;
        this.setMessageColor(res.status);
        console.log(res)
      });
  } 
  
  constructor(public navCtrl: NavController, private http: HttpClient, private storage: Storage) { }

  ngOnInit() {
    //retrieve local data from Storage
    this.storage.get('username').then((username) => this.username = username)
    this.storage.get('password').then((password) => this.password = password)
  }

}

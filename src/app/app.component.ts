import { Component, OnInit } from '@angular/core';
import { Platform, ToastController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Firebase } from '@ionic-native/firebase';

import { HomePage } from '../pages/home/home';

import { DataProvider } from '../providers/data/data';

@Component({
  templateUrl: 'app.html'
})
export class MyApp implements OnInit {
  rootPage: any = HomePage;
  message: string;

  constructor(statusBar: StatusBar, splashScreen: SplashScreen, private firebase: Firebase,
              public platform: Platform, public toastCtrl: ToastController, private data: DataProvider) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
      try {
        this.initializeFirebase();
      } catch (error) {
        this.firebase.logError(error);
      }
    });
  }

  ngOnInit() {
    this.data.currentMessage.subscribe(message => this.message = message);
  }

  initializeFirebase() {
    if (!this.platform.is('core')) {
      this.firebase.subscribe('all');
      this.platform.is('android') ? this.initializeFirebaseAndroid() : this.initializeFirebaseIOS();
    }
  }

  initializeFirebaseAndroid() {
    this.firebase.getToken().then(token => {
      console.log('TEGO');
      console.log(token);
      this.data.changeMessage(token);
      // let toast = this.toastCtrl.create({
      //   message: token,
      //   duration: 30000
      // });
      // toast.present();
    });
    this.firebase.onTokenRefresh().subscribe(token => {
      console.log('TEGO REFRESH');
      console.log(token);
    });
    this.subscribeToPushNotifications();
  }

  initializeFirebaseIOS() {
    this.firebase.grantPermission()
      .then(() => {
        this.firebase.getToken().then(token => {
        });
        this.firebase.onTokenRefresh().subscribe(token => {
        });
        this.subscribeToPushNotifications();
      })
      .catch((error) => {
        this.firebase.logError(error);
      });
  }

  subscribeToPushNotifications() {
    this.firebase.onNotificationOpen().subscribe((response) => {
      if (response.tap) {
        //Received while app in background (this should be the callback when a system notification is tapped)
        //This is empty for our app since we just needed the notification to open the app
      } else {
        //received while app in foreground (show a toast)
        let toast = this.toastCtrl.create({
          message: response.body,
          duration: 3000
        });
        toast.present();
      }
    });
  }
}


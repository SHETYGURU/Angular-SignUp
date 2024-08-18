import { Component, OnInit } from '@angular/core';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Firestore, query, where, collection, getDocs } from '@angular/fire/firestore';
import { HotToastService } from '@ngneat/hot-toast';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
})
export class LandingComponent implements OnInit {
  landingForm = this.fb.group({
    email: ['', [Validators.email]],
    phone: ['', [Validators.pattern(/^\d{10}$/)]],
  });

  constructor(
    private firestore: Firestore,
    private toast: HotToastService,
    private router: Router,
    private fb: NonNullableFormBuilder
  ) {}

  ngOnInit(): void {}

  proceed() {
    const email = this.landingForm.get('email')?.value;
    const phone = this.landingForm.get('phone')?.value;

    if (!email && !phone) {
      this.toast.error('Please provide either an email or phone number.');
      return;
    }

    const usersCollection = collection(this.firestore, 'users');

    let q;

    if (email && phone) {
      q = query(usersCollection, where('email', '==', email), where('phone', '==', phone));
    } else if (email) {
      q = query(usersCollection, where('email', '==', email));
    } else {
      q = query(usersCollection, where('phone', '==', phone));
    }

    getDocs(q)
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          this.router.navigate(['/login']);
        } else {
          this.router.navigate(['/sign-up']);
        }
      })
      .catch((error) => {
        this.toast.error(`Error occurred: ${error.message}`);
      });
  }
}
``

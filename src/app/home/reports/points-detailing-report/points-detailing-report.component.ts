/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable quote-props */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/quotes */
import { GlobalApiService } from 'src/app/services/global-api.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  MenuController,
  NavController,
  AlertController,
  LoadingController,
  ModalController,
} from '@ionic/angular';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { HttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';


@Component({
  selector: 'app-points-detailing-report',
  templateUrl: './points-detailing-report.component.html',
  styleUrls: ['./points-detailing-report.component.scss'],
})
export class PointsDetailingReportComponent implements OnInit {
  data: any;
  displayedColumns = ['slNo', 'CourseName', 'Points'];
  coursesList = [];
  userId: any;
  type: string;
  user: any;
  bus = [];

  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
    private service: GlobalApiService,
    public alertCtrl: AlertController,
    public loadingController: LoadingController,
    private http: HttpClient,
    private router: ActivatedRoute,
    private modalController: ModalController

  ) {
    this.router.queryParams.subscribe((params) => {
      if (params.uid) {
        this.userId = params.uid;
        this.type = params.type;
        this.ViewUserCourses(params.uid, -1);
      }
    });
  }

  ngOnInit() {}

  ViewUserCourses(uid: any, filterVal: any) {
    this.showLoader('Loading User\'s Points Detail...Please wait...');

    this.coursesList = [];

    const data = new FormData();
    data.append('type', this.type);
    data.append('bu_id', filterVal);
    data.append('userId', uid);
    data.append('user_id', localStorage.getItem('user_id'));

    this.service.user_point_filtered_courses(data).subscribe(
      (res) => {
        this.user = res.Data.User;
        res.Data.Courses.forEach((element: any) => {
          const user = {
            sl_no: element.sl_no,
            course_name: element.course_name,
            course_id: element.course_id,
            enrolled_on: element.enrolled_on,
            last_access: element.last_access
          };
          this.coursesList.push(user);
        });
        this.applyFilter('');
        this.hideLoader();
      },
      (err) => {
        console.log(err);
        this.hideLoader();
      }
    );

    this.dataSource = new MatTableDataSource<any>(this.coursesList);
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(filterValue: any) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  ionViewDidEnter() {
    this.dataSource.paginator = this.paginator;
  }

  // Show the loader for infinite time
  showLoader(msg: any) {
    this.loadingController
      .create({
        message: msg,
      })
      .then((res) => {
        res.present();
      });
  }

  // Hide the loader if already created otherwise return error
  hideLoader() {
    this.loadingController
      .dismiss()
      .then((res) => {})
      .catch((error) => {});
  }

  async closeModal() {
    await this.modalController.dismiss();
  }

  async showAlert(msg: string, uid: any) {
    const alert = await this.alertCtrl.create({
      header: 'Status',
      message: msg,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            this.ViewUserCourses(uid, -1);
          },
        },
      ],
    });
    await alert.present();
    await alert.onDidDismiss();
  }

  selectFilter(value: any) {
    this.ViewUserCourses(this.userId, value);
  }


}

import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Tag } from 'src/app/models/admin/tag.model';
import { AdminsService } from 'src/app/services/admin/admins.service';
import { User } from '../../../models/admin/user.model';
import { TagsService } from '../../../services/admin/tags.service';
import { UsersService } from '../../../services/admin/users.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  adminInfo: any = '';
  newTags: Tag[] = [];
  newUser: User = { name: '', email: '', owner: '', tags: this.newTags, password: '' }
  tags: Tag[] = [];
  users: User[] = [];
  testList = [];
  testListCSV = [];

  convertedObj:any = "";
  convert(objArray) {
    console.log(objArray.result);
    this.testListCSV = objArray.result;
  }
  onError(err) {
    this.convertedObj = err
    console.log(err);
  }

  constructor(private userServices: UsersService, private tagsServices: TagsService, private cookieService: CookieService, private adminsService: AdminsService) { }

  ngOnInit(): void {
    this.adminInfo = this.cookieService.get("currentAdminId");
    this.userServices.getAllUsers(this.adminInfo).then(u => { this.users = u, console.log(u) });
    this.tagsServices.getAllTags(this.adminInfo).then(u => { this.tags = u, console.log(u) });
  }

  onFileChange(event) {
    const fileToLoad = event.target.files[0];
    const fileReader = new FileReader();

    fileReader.addEventListener('load', (event) => {
      this.testList = JSON.parse(<string>event.target.result);
      console.log(this.testList)
    });

    fileReader.readAsText(fileToLoad, 'UTF-8');

  }

  addAllUsersJSON() {
    this.testList.map(u => {
      u.tags = this.tags;
      u.owner = this.adminInfo;
      this.userServices.post(u).then(res => {
        if (typeof res !== 'undefined') {
          this.users.push(u);
        }
      }).catch((err) => console.log(err))
    })
  }

  addAllUsersCSV() {
    this.testListCSV.map(u => {
      u.tags = this.tags;
      u.owner = this.adminInfo;
      this.userServices.post(u).then(res => {
        if (typeof res !== 'undefined') {
          this.users.push(u);
        }
      }).catch((err) => console.log(err))
    })
  }

  editState(user: User) {
    this.users.map((u: User) => {
      u.editable = false;
      user.editable = true;
    })

    this.tags.map(u => {
      u.checked = false;
      let exist = user.tags.find(b => b.name == u.name);
      user.tags.find(b => {
        if (b.name == u.name) {
          b.checked = true;
        }
      });

      if (!exist) {
        user.tags.push(u)
      }
    })
  }





  addUser() {
    this.newUser.owner = this.adminInfo;
    this.newUser.tags = this.tags.filter(u => u.checked == true);
    let temporalTags = this.newUser.tags;
    let newMappedUser = [];
    this.newUser.tags.map(u => {
      newMappedUser.push(u._id)
    });

    this.newUser.tags = newMappedUser;
    this.userServices.post(this.newUser).then(res => {
      if (typeof res !== 'undefined') {
        res.tags = temporalTags;
        this.users.push(res);
        this.newUser = { name: '', email: '', owner: this.adminInfo, tags: this.newTags, password: '' };
      }
    }).catch((err) => console.log(err))
  }

  deleteUser(id: string) {
    this.userServices.deleteUser(id)
      .then(() => {
        const userFiltered = this.users.filter((user: User) => user._id != id);
        this.users = userFiltered;
      }).catch((err) => console.log(err))
  }

  updateUser(user: User) {
    let tempTags = user.tags.filter(u => u.checked == true);
    let newMappedUser = [];
    tempTags.map(u => {
      newMappedUser.push(u._id)
    });

    user.tags = newMappedUser;

    user.editable = false;
    this.userServices.updateUser(user._id, user).then(() => {
      user.tags = tempTags;
    })
  }



}

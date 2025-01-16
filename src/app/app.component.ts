import { Component } from '@angular/core';
import {PolygonComponent} from '../components/konva-custom-polygon/custom-polygon/polygon.component'
import {HeaderComponent} from '../components/header/header.component'
import { ActionSidebarComponent } from '../components/action-sidebar/action-sidebar.component';


@Component({
  selector: 'app-root',
  imports: [PolygonComponent, HeaderComponent, ActionSidebarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'polygon-masking';
}

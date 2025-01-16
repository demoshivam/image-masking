import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-action-sidebar',
  templateUrl: './action-sidebar.component.html',
  styleUrls: ['./action-sidebar.component.scss']
})
export class ActionSidebarComponent {
  @Output() reset = new EventEmitter<void>();
  @Output() export = new EventEmitter<void>();


  onReset() {
    this.reset.emit();
  }

  onExport() {
    this.export.emit();
  }
}

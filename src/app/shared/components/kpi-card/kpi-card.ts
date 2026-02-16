import { Component, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { Value } from '@core/interfaces/value.interdace';
import { ClassNamesModule } from 'primeng/classnames'



@Component({
  selector: 'app-kpi-card',
  imports: [CommonModule, CardModule, ClassNamesModule],
  templateUrl: './kpi-card.html',
  styleUrl: './kpi-card.css',
})
export class KpiCard implements OnInit {
  
  card = input<Value>();
  
  ngOnInit(): void {
   console.log(this.card());
   
  }

   getIconClasses(): string {
    return `flex items-center justify-center rounded-lg icon-bg-${this.card()?.colorScheme}`;
  }

  getIconColor(): string {
    return `icon-color-${this.card()?.colorScheme}`;
  }

}

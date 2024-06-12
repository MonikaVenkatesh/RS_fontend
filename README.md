

import { Component } from '@angular/core';
import { FileService } from './file.service';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(private fileService: FileService) {}

  downloadAndConvertFile() {
    this.fileService.downloadFile('your-api-endpoint').subscribe((blob: Blob) => {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const data = JSON.parse(event.target.result);
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
        const xlsxBlob = this.workbookToBlob(workbook);

        FileSaver.saveAs(xlsxBlob, 'data.xlsx');
      };
      reader.readAsText(blob);
    });
  }

  workbookToBlob(workbook: XLSX.WorkBook): Blob {
    const wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'binary' };
    const wbout = XLSX.write(workbook, wopts);

    function s2ab(s: string): ArrayBuffer {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
      return buf;
    }

    return new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
  }
}





# Project

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.1.6.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

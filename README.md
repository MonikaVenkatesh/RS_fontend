--------------------reportservice
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = 'YOUR_API_ENDPOINT'; // Replace with your API endpoint

  constructor(private http: HttpClient) { }

  getReports(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer YOUR_HARDCODED_TOKEN', // Replace with your token
      'Content-Type': 'application/json'
    });

    return this.http.get<any>(this.apiUrl, { headers });
  }

  fetchReport(reportId: string): Observable<Blob> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer YOUR_HARDCODED_TOKEN', // Replace with your token
      'Content-Type': 'application/json'
    });

    return this.http.get(`${this.apiUrl}/report/${reportId}`, { headers, responseType: 'blob' });
  }
}
----------------component
import { Component, OnInit } from '@angular/core';
import { ReportService } from './report.service';
import { ColDef } from 'ag-grid-community';

@Component({
  selector: 'app-report-table',
  template: `
    <ag-grid-angular
      style="width: 100%; height: 500px;"
      class="ag-theme-alpine"
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      (gridReady)="onGridReady($event)">
    </ag-grid-angular>
  `,
  styleUrls: ['./report-table.component.css']
})
export class ReportTableComponent implements OnInit {
  rowData: any[] = [];
  columnDefs: ColDef[] = [
    { field: 'reportName', headerName: 'Report Name' },
    {
      field: 'download',
      headerName: 'Download',
      cellRenderer: (params) => {
        return `<button (click)="fetchReport('${params.data.id}')">Download</button>`;
      }
    }
  ];

  constructor(private reportService: ReportService) { }

  ngOnInit(): void {
    this.reportService.getReports().subscribe(data => {
      this.rowData = data.reports;
    });
  }

  fetchReport(reportId: string): void {
    this.reportService.fetchReport(reportId).subscribe(response => {
      const url = window.URL.createObjectURL(response);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportId}.wid`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}


------------------------controller
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

@RestController
@RequestMapping("/api")
public class ReportController {

    @PostMapping("/convertToExcel")
    public ResponseEntity<byte[]> convertToExcel(@RequestParam("file") MultipartFile file) {
        try (InputStream inputStream = file.getInputStream();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            // Your logic to convert .wid to Excel goes here
            // For example purposes, we're just copying input to output
            byte[] buffer = new byte[1024];
            int bytesRead;
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                outputStream.write(buffer, 0, bytesRead);
            }

            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=report.xlsx");
            return new ResponseEntity<>(outputStream.toByteArray(), headers, HttpStatus.OK);
        } catch (IOException e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}



--------------------file conersion

import org.springframework.stereotype.Service;

import java.io.*;

@Service
public class FileConversionService {

    public ByteArrayOutputStream convertWidToExcel(InputStream inputStream) throws IOException {
        // Implement your .wid to Excel conversion logic here
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        byte[] buffer = new byte[1024];
        int bytesRead;
        while ((bytesRead = inputStream.read(buffer)) != -1) {
            outputStream.write(buffer, 0, bytesRead);
        }
        return outputStream;
    }
}



---------------------------application.properties


spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB











































































----------------------frontend----------------
import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-root',
  template: `
    <ag-grid-angular
      style="width: 100%; height: 500px;"
      class="ag-theme-alpine"
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      (gridReady)="onGridReady($event)">
    </ag-grid-angular>
  `
})
export class AppComponent {
  columnDefs = [
    { headerName: 'ID', field: 'id' },
    { headerName: 'Name', field: 'name' },
    {
      headerName: 'Action',
      field: 'action',
      cellRenderer: (params) => {
        const link = document.createElement('a');
        link.innerText = 'Fetch Report';
        link.href = '#';
        link.addEventListener('click', () => this.fetchReport(params.data.id));
        return link;
      }
    }
  ];

  rowData = [
    { id: 1, name: 'Report 1' },
    { id: 2, name: 'Report 2' }
  ];

  constructor(private http: HttpClient) {}

  onGridReady(params) {
    params.api.sizeColumnsToFit();
  }

  fetchReport(reportId: number) {
    const headers = new HttpHeaders({
      'Authorization': 'hard-coded-token'
    });

    this.http.get(`http://localhost:8080/fetch-wid-file/${reportId}`, { headers, responseType: 'blob' }).subscribe(blob => {
      const formData = new FormData();
      formData.append('file', blob, `report-${reportId}.wid`);

      this.http.post('http://localhost:8080/upload-wid-file', formData, { responseType: 'blob' }).subscribe(response => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${reportId}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      });
    });
  }
}


----------------------backend
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class WidFileService {
    
    public InputStream fetchWidFile(Long reportId) throws IOException {
        // Mock implementation: Replace with actual API call to fetch the .wid file
        Path path = Paths.get("path/to/report-" + reportId + ".wid");
        return Files.newInputStream(path);
    }
}


----------------------------
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Scanner;
import java.util.stream.Collectors;

@Service
public class ExcelService {

    public byte[] createExcel(InputStream widInputStream) throws IOException {
        List<String> data;
        try (Scanner scanner = new Scanner(widInputStream)) {
            data = scanner.lines().collect(Collectors.toList());
        }

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Data");
            int rowCount = 0;
            for (String line : data) {
                Row row = sheet.createRow(rowCount++);
                String[] values = line.split(","); // Assuming comma-separated values
                int colCount = 0;
                for (String value : values) {
                    Cell cell = row.createCell(colCount++);
                    cell.setCellValue(value);
                }
            }
            workbook.write(bos);
            return bos.toByteArray();
        }
    }
}


-------------------------------
contrller


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

@RestController
public class FileController {

    @Autowired
    private WidFileService widFileService;

    @Autowired
    private ExcelService excelService;

    @GetMapping("/fetch-wid-file/{reportId}")
    public ResponseEntity<byte[]> fetchWidFile(@RequestHeader("Authorization") String token,
                                               @PathVariable Long reportId) throws IOException {
        // Hard-coded token validation
        if (!"hard-coded-token".equals(token)) {
            return ResponseEntity.status(403).build();
        }

        // Fetch the .wid file
        InputStream widInputStream = widFileService.fetchWidFile(reportId);

        byte[] fileBytes = widInputStream.readAllBytes();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=report-" + reportId + ".wid")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(fileBytes);
    }

    @PostMapping("/upload-wid-file")
    public ResponseEntity<byte[]> uploadWidFile(@RequestParam("file") MultipartFile file) throws IOException {
        // Convert data to Excel
        byte[] excelBytes;
        try (InputStream widInputStream = file.getInputStream()) {
            excelBytes = excelService.createExcel(widInputStream);
        }

        // Return the Excel file as a response
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", file.getOriginalFilename().replace(".wid", ".xlsx"));

        return ResponseEntity.ok()
                .headers(headers)
                .body(excelBytes);
    }
}




















































































import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ReportController {

    @Autowired
    private RestTemplate restTemplate;

    @GetMapping("/reports")
    public List<Report> getReports() {
        // Return list of reports from your data source
        // This is just a placeholder
        return List.of(new Report(1, "Report 1"), new Report(2, "Report 2"));
    }

    @GetMapping("/download/{fileId}")
    public ResponseEntity<byte[]> downloadFile(@PathVariable String fileId) throws IOException {
        // Hard-coded token validation
        String token = "hard-coded-token";

        // Fetch the .wid file from external API
        Path widFilePath = fetchWidFile(fileId, token);

        // Convert data to Excel
        byte[] excelBytes = createExcel(widFilePath);

        // Return the Excel file as a response
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "report.xlsx");

        return ResponseEntity.ok()
                .headers(headers)
                .body(excelBytes);
    }

    private Path fetchWidFile(String fileId, String token) throws IOException {
        String url = "http://external-api-url/" + fileId;
        ResponseEntity<byte[]> response = restTemplate.getForEntity(url, byte[].class);

        Path tempFile = Files.createTempFile("data", ".wid");
        Files.write(tempFile, response.getBody());
        return tempFile;
    }

    private byte[] createExcel(Path widFilePath) throws IOException {
        List<String> data = Files.readAllLines(widFilePath);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Data");
            int rowCount = 0;
            for (String line : data) {
                Row row = sheet.createRow(rowCount++);
                String[] values = line.split(","); // Assuming comma-separated values
                int colCount = 0;
                for (String value : values) {
                    Cell cell = row.createCell(colCount++);
                    cell.setCellValue(value);
                }
            }
            workbook.write(bos);
            return bos.toByteArray();
        }
    }
}



🙏🙏🙏🙏🙏🙏





// report.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {
  columnDefs = [
    { headerName: 'ID', field: 'id' },
    { headerName: 'Name', field: 'name' },
    {
      headerName: 'Actions',
      field: 'id',
      cellRenderer: (params) => {
        return `<a href="javascript:void(0);" onclick="downloadFile('${params.value}')">Download</a>`;
      }
    }
  ];

  rowData: any;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.http.get('http://your-backend-api/reports', {
      headers: new HttpHeaders({
        'Authorization': 'Bearer hard-coded-token'
      })
    }).subscribe(data => {
      this.rowData = data;
    });
  }
}

declare global {
  interface Window { downloadFile: any; }
}

window.downloadFile = (fileId) => {
  fetch(`http://your-backend-api/download/${fileId}`, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer hard-coded-token'
    }
  })
  .then(response => response.blob())
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'report.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
  });
};







🤭🤭🤭

Convert and download wid file into Excel file from json response with hard-coded headers and token in spring boot

ChatGPT
To convert and download a .wid file into an Excel file using a JSON response with hard-coded headers and token in a Spring Boot application, you can follow these steps:

Define the JSON Structure and Headers: Assume you have a JSON response with a specific structure and you need to read the .wid file contents.

Read the .wid File: Implement logic to read and parse the .wid file contents.

Convert the Data to Excel: Use Apache POI library to write the parsed data into an Excel file.

Provide Download Functionality: Implement a Spring Boot controller endpoint to handle file download requests.

Here's an example implementation:

Step 1: Add Dependencies
Ensure you have the required dependencies in your pom.xml:

xml
Copy code
<dependencies>
    <!-- Spring Boot Starter Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <!-- Apache POI for Excel processing -->
    <dependency>
        <groupId>org.apache.poi</groupId>
        <artifactId>poi-ooxml</artifactId>
        <version>5.2.3</version>
    </dependency>
    <!-- Lombok for boilerplate code reduction (optional) -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
</dependencies>
Step 2: Read and Parse .wid File
Assuming .wid is a simple text file, create a service to read it:

java
Copy code
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class WidFileService {
    public List<String> readWidFile(String filePath) throws IOException {
        Path path = Paths.get(filePath);
        return Files.readAllLines(path);
    }
}
Step 3: Convert Data to Excel
Create a service to handle Excel conversion:

java
Copy code
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

@Service
public class ExcelService {
    public byte[] createExcel(List<String> data) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Data");
            int rowCount = 0;
            for (String line : data) {
                Row row = sheet.createRow(rowCount++);
                String[] values = line.split(","); // Assuming comma-separated values
                int colCount = 0;
                for (String value : values) {
                    Cell cell = row.createCell(colCount++);
                    cell.setCellValue(value);
                }
            }
            workbook.write(bos);
            return bos.toByteArray();
        }
    }
}






import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class FileController {

    @Autowired
    private WidFileService widFileService;

    @Autowired
    private ExcelService excelService;

    @GetMapping("/download-excel")
    public ResponseEntity<byte[]> downloadExcel(@RequestHeader("Authorization") String token, 
                                                @RequestParam String filePath) throws IOException {
        // Hard-coded token validation
        if (!"hard-coded-token".equals(token)) {
            return ResponseEntity.status(403).build();
        }

        // Read the .wid file
        List<String> data = widFileService.readWidFile(filePath);

        // Convert data to Excel
        byte[] excelBytes = excelService.createExcel(data);

        // Return the Excel file as a response
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "data.xlsx");

        return ResponseEntity.ok()
                .headers(headers)
                .body(excelBytes);
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

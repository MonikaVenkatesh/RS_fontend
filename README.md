ChatGPT

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

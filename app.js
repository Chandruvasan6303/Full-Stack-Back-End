/*
 * Trinom Digital Pvt Ltd ("COMPANY") CONFIDENTIAL                             *
 * Copyright (c) 2023 Trinom Digital Pvt Ltd, All rights reserved              *
 *                                                                             *
 * NOTICE:  All information contained herein is, and remains the property      *
 * of COMPANY. The intellectual and technical concepts contained herein are    *
 * proprietary to COMPANY and may be covered by Indian and Foreign Patents,    *
 * patents in process, and are protected by trade secret or copyright law.     *
 * Dissemination of this information or reproduction of this material is       *
 * strictly forbidden unless prior written permission is obtained from         *
 * COMPANY. Access to the source code contained herein is hereby forbidden     *
 * to anyone except current COMPANY employees, managers or contractors who     *
 * have executed Confidentiality and Non-disclosure agreements explicitly      *
 * covering such access.                                                       *
 *                                                                             *
 * The copyright notice above does not evidence any actual or intended         *
 * publication or disclosure of this source code, which includes               *
 * information that is confidential and/or proprietary, and is a trade secret, *
 * of COMPANY. ANY REPRODUCTION, MODIFICATION, DISTRIBUTION, PUBLIC            *
 * PERFORMANCE, OR PUBLIC DISPLAY OF OR THROUGH USE OF THIS SOURCE CODE        *
 * WITHOUT THE EXPRESS WRITTEN CONSENT OF COMPANY IS STRICTLY PROHIBITED,      *
 * AND IN VIOLATION OF APPLICABLE LAWS AND INTERNATIONAL TREATIES. THE         *
 * RECEIPT OR POSSESSION OF THIS SOURCE CODE AND/OR RELATED INFORMATION DOES   *
 * NOT CONVEY OR IMPLY ANY RIGHTS TO REPRODUCE, DISCLOSE OR DISTRIBUTE ITS     *
 * CONTENTS, OR TO MANUFACTURE, USE, OR SELL ANYTHING THAT IT MAY DESCRIBE,    *
 * IN WHOLE OR IN PART.                                                        *
 *                                                                             *
 * File: \app.js                                                               *
 * Project: back                                                               *
 * Created Date: Saturday, December 30th 2023, 4:50:41 pm                      *
 * Author:  CHANDRUVASAN S <chandruvasan@codestax.ai>                          *
 * -----                                                                       *
 * Last Modified:                                                              *
 * Modified By:                                                                *
 * -----                                                                       *
 * Any app that can be written in JavaScript,                                  *
 *     will eventually be written in JavaScript !!                             *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date         By  Comments                                                   *
 * --------------------------------------------------------------------------- *
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(bodyParser.json());

AWS.config.update({
  region: 'localhost',
  endpoint: 'http://localhost:8003',
  accessKeyId: '123456789',
  secretAccessKey: '123456789'
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

app.post('/api/register', async (req, res) => {
  const newStudent = req.body;
  try {
    await dynamoDB.put({ TableName: 'Student_Table1', Item: newStudent }).promise();
    console.log('New student registered:', newStudent);
    res.json({ message: 'Student registered successfully' });
  } catch (error) {
    console.error('Error registering student in DynamoDB', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/registeredStudents', async (req, res) => {
  try {
    const scanResult = await dynamoDB.scan({ TableName: 'Student_Table1' }).promise();
    const studentList = scanResult.Items;
    res.json(studentList);
  } catch (error) {
    console.error('Error fetching registered students from DynamoDB', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// New endpoint to delete a student
app.delete('/api/deleteStudent/:department/:studentId', async (req, res) => {
  const department = req.params.department;
  const studentId = req.params.studentId;

  try {
    await dynamoDB.delete({
      TableName: 'Student_Table1',
      Key: {
        Department: department, // Replace with your actual partition key attribute name
        Student_ID: studentId   // Replace with your actual sort key attribute name
      }
    }).promise();

    console.log('Student deleted:', { Department: department, Student_ID: studentId });
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student from DynamoDB', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/api/updateStudent/:department/:studentId', async (req, res) => {
  const department = req.params.department;
  const studentId = req.params.studentId;
  const updatedStudent = req.body;

  try {
    await dynamoDB.update({
      TableName: 'Student_Table1',
      Key: { Department: department, Student_ID: studentId },
      UpdateExpression: 'set #name = :name, #phone = :phone, #sslcMark = :sslcMark, #hscMark = :hscMark',
      ExpressionAttributeNames: { '#name': 'name', '#phone': 'phone', '#sslcMark': 'sslcMark', '#hscMark': 'hscMark' },
      ExpressionAttributeValues: {
        ':name': updatedStudent.name,
        ':phone': updatedStudent.phone,
        ':sslcMark': updatedStudent.sslcMark,
        ':hscMark': updatedStudent.hscMark,
      },
    }).promise();

    console.log('Student updated:', { Department: department, Student_ID: studentId });
    res.json({ message: 'Student updated successfully' });
  } catch (error) {
    console.error('Error updating student in DynamoDB', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

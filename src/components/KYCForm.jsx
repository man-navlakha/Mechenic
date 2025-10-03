// KYCForm.js
import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const KYCForm = () => {
  const formRef = useRef();

  const generatePDF = () => {
    html2canvas(formRef.current).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      pdf.addImage(imgData, 'PNG', 10, 10);
      pdf.save('KYC_Form.pdf');
    });
  };

  return (
    <div>
      <div ref={formRef} style={{ 
        width: '800px', 
        padding: '20px', 
        border: '1px solid black', 
        fontFamily: 'serif',
        backgroundColor: '#fff'
      }}>
        <h2 style={{ textAlign: 'center' }}>KYC Form</h2>
        <div>
          <label>Full Name:</label>
          <input type="text" name="fullName" style={{ width: '100%' }} />
        </div>
        <div>
          <label>Date of Birth:</label>
          <input type="date" name="dob" style={{ width: '100%' }} />
        </div>
        <div>
          <label>Address:</label>
          <textarea name="address" style={{ width: '100%' }} />
        </div>
        <div>
          <label>Government ID Number:</label>
          <input type="text" name="govtId" style={{ width: '100%' }} />
        </div>
        <div>
          <label>Signature:</label>
          <input type="text" placeholder="(Draw or Upload feature optional)" style={{ width: '100%' }} />
        </div>
      </div>

      <button onClick={generatePDF}>Download PDF</button>
    </div>
  );
};

export default KYCForm;

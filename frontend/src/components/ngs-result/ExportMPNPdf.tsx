import React, { FunctionComponent } from 'react';
import { Font, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import KAIU from '../../font/KAIU.TTF';
import KAIUBold from '../../font/KAIUBold.TTF';
import { Height } from '@material-ui/icons';
import { PdfData } from '../../models/pdf.model';
import { HealthCareWorkers } from '../../models/healthCareWorkers.model';
import { Reference } from '../../models/reference.enum';
import { Sex } from '../../models/sex.enum';

// Create styles
const styles = StyleSheet.create({
	page: {
		flexDirection: 'column',
		fontFamily: 'KAIU',
		paddingLeft: '2.5cm',
		paddingRight: '1cm',
		paddingTop: '1.5cm',
        paddingBottom: '1.5cm'
	},
	titleView: {
		display: 'flex',
		textAlign: 'center',
		fontSize: 12,
		lineHeight: 1.5
	},
	footerView: {
		position: 'absolute',
		flexDirection: 'row',
		fontSize: 10,
		bottom: '0.3cm',
		left: '1cm'
	},
	footerVersionView: {
		display: 'flex',
		position: 'absolute',
		flexDirection: 'row',
		fontSize: 10,
		bottom: '0.3cm',
		right: '0.8cm'
	},
	headerView: {
		display: 'flex',
		fontSize: 12
	},
	containView: {
		display: 'flex',
		position: 'relative',
		flexDirection: 'column',
		fontSize: 12,
		fontFamily: 'Times-Roman',
		padding: 5,
	},
	containInfoView: {
		display: 'flex',
		flexDirection: 'row',
		fontSize: 12
	},
	infoView: {
		position: 'absolute',
 		fontSize: 10,
 		border: '1px solid black',
 		paddingTop: 5,
 		paddingLeft: 2,
 		width: 150,
 		height: 50,
		top: '1cm',
	},
	table: {
		width: 'auto',
		fontSize: 11,
		borderStyle: 'solid',
		borderWidth: 1,
		borderRightWidth: 0,
		borderBottomWidth: 0
	},
	tableRow: {
		margin: 'auto',
		flexDirection: 'row'
	},
	tableCol: {
		width: '25%',
		justifyContent: 'center',
		borderStyle: 'solid',
		borderWidth: 1,
		borderLeftWidth: 0,
		borderTopWidth: 0
	},
	tableCell: {
		margin: 2,
		fontSize: 10
	},
	tableNoteCell: {
		margin: 5,
		fontSize: 10
	},
    pageNumber: {
        position: 'absolute',
        fontSize: 11,
        bottom: 0,
        left: 0,
        right: '1cm',
        top: '4.44cm',
        textAlign: 'right',

      },addressView:{
		display: 'flex',
 		flexDirection: 'row',
 		fontSize: 10,
	  }
});

type ExportPdfProps = {
	data: PdfData;
	memberlist: HealthCareWorkers[];
};
// Create Document Component
export const MyDocumentMPN: FunctionComponent<ExportPdfProps> = (prop) => (
	<Document>
		<Page size="A4" style={styles.page}>
			<Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
                `第 ${pageNumber} 頁，共 ${totalPages} 頁`
            )} fixed />
			<View style={styles.headerView} fixed>
				<View style={styles.infoView}>
 					<Text>病歷號 : {prop.data.medicalRecordNo}</Text>
 					<Text>姓  名 : {prop.data.patientName}</Text>
 					<Text>生  日 : {new Date( prop.data.patientBirth).getFullYear()}/{new Date( prop.data.patientBirth).getMonth()+1}/{new Date( prop.data.patientBirth).getDate()}</Text>
 				</View>
				<View style={styles.titleView}>
					<Text>國 立 臺 灣 大 學 醫 學 院 附 設 醫 院</Text>
					<Text style={{fontFamily:"Times-Roman"}}>National Taiwan University Hospital</Text>
					<Text style={{ fontSize: 16, fontFamily: 'KAIUBold' }}>次世代定序檢驗報告</Text>
					<Text style={{ fontSize: 16, fontFamily: 'KAIUBold' }}>(檢驗醫學部)</Text>
				</View>
				<View style={styles.addressView}>
					<Text style={{ fontSize: 11, width: 150 }}>台北市中山南路七號</Text>
				</View>
				<Text>{'\n'}</Text>
			</View>
            <View style={{position: 'relative'}} fixed >
				<View>
					<View style={{position: 'absolute', top:-10,left:0, height:2, width:496, backgroundColor:'black'}} />
					<View style={{position: 'absolute', top:-10,left:0, height:660, width:2, backgroundColor:'black'}} />
					<View style={{position: 'absolute', top:-10,right:0, height:660, width:2, backgroundColor:'black'}} />
					<View style={{position: 'absolute', top:650,left:0, height:2, width:496, backgroundColor:'black'}} />
				</View>
			</View>

			<View style={styles.containView}>
				<View style={styles.containInfoView}>
					<Text style={{ width: 175, fontFamily: 'KAIU' }}>報告版本 : 01</Text>
				</View>
				<View style={styles.containInfoView}>
					<Text style={{ width: 175, fontFamily: 'KAIU' }}>檢查日期 : {`${new Date( prop.data.checkDate).getFullYear()}/${(new Date( prop.data.checkDate).getMonth() > 8) ? (new Date( prop.data.checkDate).getMonth() + 1) : ('0' + (new Date( prop.data.checkDate).getMonth() + 1))}/${(new Date( prop.data.checkDate).getDate() > 9) ? new Date( prop.data.checkDate).getDate() : ('0' + new Date( prop.data.checkDate).getDate())}`}</Text>
					<Text style={{ width: 175, fontFamily: 'KAIU' }}>檢體編號 : {prop.data.specimenNo}</Text>
					<Text style={{ width: 175, fontFamily: 'KAIU' }}>科分號 : {prop.data.departmentNo}</Text>
				</View>
				<View style={styles.containInfoView}>
					<Text style={{ width: 175, fontFamily: 'KAIU' }}>性    別 : {prop.data.patientSex}</Text>
					<Text style={{ width: 175, fontFamily: 'KAIU' }}>檢體類別 : {prop.data.specimenType}</Text>
					<Text style={{ width: 175, fontFamily: 'KAIU' }}>檢體狀態 : {prop.data.specimenStatus}</Text>
				</View>
				<View style={styles.containInfoView}>
					{/* <Text style={{ width: 350, fontFamily: 'KAIU' }}>檢測項目 : MPN mutation screening for malignancies</Text> */}
					<Text style={{ width: 350, fontFamily: 'KAIU' }}>檢測項目 : 骨髓增生性腫瘤基因突變檢測</Text>
				</View>
				
				<Text style={{fontFamily: 'Times-Bold'}}>{'\n'}I. Variant list:</Text>
				<View style={styles.table} wrap={true}>
					<View style={styles.tableRow}>
						<View style={[ styles.tableCol, { width: '10%', alignItems: 'center' } ]}>
							<Text style={{...styles.tableCell, fontFamily: 'Times-Bold'}}>Gene</Text>
						</View>
						<View style={[ styles.tableCol, { width: '15%', alignItems: 'center' } ]}>
							<Text style={{...styles.tableCell, fontFamily: 'Times-Bold'}}>Reference</Text>
						</View>
						<View style={[ styles.tableCol, { width: '20%', alignItems: 'center' } ]}>
							<Text style={{...styles.tableCell, fontFamily: 'Times-Bold'}}>Nucleotide Change</Text>
						</View>
						<View style={[ styles.tableCol, { width: '20%', alignItems: 'center' } ]}>
							<Text style={{...styles.tableCell, fontFamily: 'Times-Bold'}}>Protein Change</Text>
						</View>
						<View style={[ styles.tableCol, { width: '7%', alignItems: 'center' } ]}>
							<Text style={{...styles.tableCell, fontFamily: 'Times-Bold'}}>VAF</Text>
						</View>
						<View style={[ styles.tableCol, { width: '7%', alignItems: 'center' } ]}>
							<Text style={{...styles.tableCell, fontFamily: 'Times-Bold'}}>Depth</Text>
						</View>
						<View style={[ styles.tableCol, { width: '21%', alignItems: 'center' } ]}>
							<Text style={{...styles.tableCell, fontFamily: 'Times-Bold'}}>Classification</Text>
						</View>
					</View>
					{
						prop.data.list1.map((element)=>(
							<View style={styles.tableRow}>
								<View style={[ styles.tableCol, { width: '10%' } ]}>
									<Text style={styles.tableCell}>{element.geneName}</Text>
								</View>
								<View style={[ styles.tableCol, { width: '15%' } ]}>
									<Text style={styles.tableCell}>{Reference[element.geneName]}</Text>
								</View>
								<View style={[ styles.tableCol, { width: '20%' } ]}>
									<Text style={styles.tableCell}>{element.HGVSc}</Text>
								</View>
								<View style={[ styles.tableCol, { width: '20%' } ]}>
									<Text style={styles.tableCell}>{element.HGVSp}</Text>
								</View>
								<View style={[ styles.tableCol, { width: '7%' } ]}>
									<Text style={styles.tableCell}>{parseFloat((element.freq / 100.0).toFixed(2))}</Text>
								</View>
								<View style={[ styles.tableCol, { width: '7%' } ]}>
									<Text style={styles.tableCell}>{element.depth}</Text>
								</View>
								<View style={[ styles.tableCol, { width: '21%' } ]}>
									<Text style={styles.tableCell}>{element.clinicalSignificance}</Text>
								</View>
							</View>
						))
					}
					
					<View style={styles.tableRow}>
						<Text style={[ styles.tableCol, { width: '100%', padding: 5 } ]}>
							{' '}
							Note: {prop.data.note1}{' '}
						</Text>
					</View>
				</View>
				
				<Text style={{ fontFamily: 'Times-Bold'}}>
					{'\n\n'}II. Methods:
				</Text>
				<Text style={{ marginHorizontal: 5 }}>
                This sequencing assay is an amplicon-based targeted panel NGS 
				(IDH1 exon 4, IDH2 exon 4, MPL exon 10, JAK2 exon 12, JAK2 exon 14, CALR exon 9) 
				designed to detect genetic variants to aid clinical decision-making. After library preparation, 
				the genetic materials are sequenced on MiniSeq sequencer, 150 bp paired-end mode. Raw FASTQ files 
				are aligned to human reference genome hg19, and subsequently single-nucleotide variants (SNV) 
				and small insertions/deletions (indel) are detected by Varscan (version 2.4.4). Pindel 
				(version 0.2.5b9) is used for detection of large indels ({'>'} 20 bp). Variants are then 
				annotated with SnpEff (version 4.3t), and pathogenicity reporting is guided by the National 
				Center for Biotechnology Information (NCBI) ClinVar database (version 2018-07-01).
				</Text>
                <Text>
					{'\n'}
				</Text>
				<View style={styles.table} wrap={true}>
					<View style={styles.tableRow}>
						<View style={styles.tableCol}>
							<Text style={styles.tableCell}>IDH1 exon 4</Text>
						</View>
						<View style={styles.tableCol}>
							<Text style={styles.tableCell}>IDH2 exon 4</Text>
						</View>
						<View style={styles.tableCol}>
							<Text style={styles.tableCell}>MPL exon 10</Text>
						</View>
						<View style={styles.tableCol}>
							<Text style={styles.tableCell}>JAK2 exon 12,14</Text>
						</View>
					</View>
					<View style={styles.tableRow}>
						<View style={styles.tableCol}>
							<Text style={styles.tableCell}>CALR exon 9</Text>
						</View>
						<View style={styles.tableCol}>
							<Text style={styles.tableCell}></Text>
						</View>
						<View style={styles.tableCol}>
							<Text style={styles.tableCell}></Text>
						</View>
						<View style={styles.tableCol}>
							<Text style={styles.tableCell}></Text>
						</View>
					</View>
					
				</View>

				<Text style={{ fontFamily: 'Times-Bold'}}>
					{'\n\n'}III. Regions with Insufficient Coverage for Evaluation ({'<'}50X){' '}
				</Text>
				<Text>
					In this sample, low-coverage regions ({'<'} 50X) consist {prop.data.coverage}% of all genomic regions targeted by
					this multiplexed NGS assay, and are listed below.{' '}
				</Text>
                <Text>
					{'\n'}
				</Text>
				<View style={styles.table} wrap={true}>
					<View style={styles.tableRow}>
						<View style={{...styles.tableCol, alignItems: 'center'}}>
							<Text style={{...styles.tableCell, fontFamily: 'Times-Bold'}}>Gene</Text>
						</View>
						<View style={{...styles.tableCol, alignItems: 'center'}}>
							<Text style={{...styles.tableCell, fontFamily: 'Times-Bold'}}>Exon</Text>
						</View>
						<View style={{...styles.tableCol, alignItems: 'center'}}>
							<Text style={{...styles.tableCell, fontFamily: 'Times-Bold'}}>From (codon)</Text>
						</View>
						<View style={{...styles.tableCol, alignItems: 'center'}}>
							<Text style={{...styles.tableCell, fontFamily: 'Times-Bold'}}>To (codon)</Text>
						</View>
					</View>
					{
						prop.data.list4.map((element)=>(
							<View style={styles.tableRow}>
								<View style={[ styles.tableCol, { width: '25%' } ]}>
									<Text style={styles.tableCell}>{element.gene}</Text>
								</View>
								<View style={[ styles.tableCol, { width: '25%' } ]}>
									<Text style={styles.tableCell}>{element.exon}</Text>
								</View>
								<View style={[ styles.tableCol, { width: '25%' } ]}>
									<Text style={styles.tableCell}>{element.from}</Text>
								</View>
								<View style={[ styles.tableCol, { width: '25%' } ]}>
									<Text style={styles.tableCell}>{element.to}</Text>
								</View>
							</View>
						))
					}
				</View>
                <Text style={{ fontFamily: 'Times-Bold'}}>
					{'\n\n'}IV. Technical Notes:
				</Text>
                <Text>
                {'  '}1.	Please note, although the accuracy of this assay has been subjected to stringent clinical validation, false-positive and false-negative results may rarely occur due to suboptimal sample quality or unexpected difficulties in the library preparation and PCR amplification processes. 
                </Text>
                <Text>
                {'  '}2.	During the development phase of this assay, the limit of detection (LOD) for single nucleotide variants (SNV) was set at 5%, and LOD for insertions/deletions (indel) was set at 10%. Variants below these LOD thresholds are not within the confidence range. In addition, regions with {"<"} 50X coverage may harbor low VAF variants that are below detection limits, and if indicated, the treating physician should consider additional testing tailored to the need of the patient. 
                </Text>
                <Text>
                {'  '}3.	Hotspot variants with VAF in 3 ~ 5% range, when listed, should be evaluated at the discretion of treating clinician. Variant detection at low frequencies may be due to sample quality, tumor heterogeneity, or other reasons, and should be interpreted with caution.
                </Text>
                <Text>
                {'  '}4.	Variants of uncertain significance (VUS) are variants that are detected but with insufficient evidence of pathogenicity, especially in the context of hematological malignancies. They are listed in the event that more evidence becomes available at a later time. In addition, knowledge regarding pathogenicity of a variant may change over time, and currently classified benign variants may change in significance at a later time point. 
                </Text>
                <Text>
                {'  '}5.	A VAF of about 50% can be either somatic or heterozygous germline mutations, and clinical judgement is advised. 
                </Text>
                <Text>
                {'  '}6.	Structural variants, such as large indels ({">"} 100 bp), duplications, inversions, rearrangement events are not covered in this assay. This assay can detect FLT3-ITD with duplicated sequence {"<"} 100bp at a sensitivity about 80% as assessed during the assay development phase, however a negative result does not totally exclude the presence of FLT3-ITD, thus correlation with conventional fragment analysis is advised.
                </Text>
                <Text>
                {'  '}7.	This report has been correlated with clinical information and other laboratory test results, such as pathology, flow cytometry, when available.
                </Text>
                <Text>
                {'  '}8.	This test was developed and its performance characteristics determined by the Department of Laboratory Medicine, National Taiwan University Hospital (NTUH). It has not been cleared or approved by the Taiwan Food and Drug Administration (FDA).
				</Text>
                <Text style={{fontFamily: 'Times-Bold'}}>
					{'\n\n'}VII. References:
				</Text>
                <Text>
                {'  '}1.	The 2016 revision to the World Health Organization classification of myeloid neoplasms and acute leukemia. Blood. 2016 May 19;127(20):2391-405.
                </Text>
                <Text>
                {'  '}2.	Genomic and epigenomic landscapes of adult de novo acute myeloid leukemia. N Engl J Med. 2013 May 30;368(22):2059-74.
                </Text>
                <Text>
                {'  '}3.	Genomic Classification and Prognosis in Acute Myeloid Leukemia. N Engl J Med. 2016 Jun 9;374(23):2209-2221.
                </Text>
                <Text>
                {'  '}4.	Landscape of genetic lesions in 944 patients with myelodysplastic syndromes. Leukemia. 2014 Feb;28(2):241-7.
                </Text>
                <Text>
                {'  '}5.	Genetics of MDS. Blood. 2019 Mar 7;133(10):1049-1059.
                </Text>
                <Text>
                {'  '}6.	Genetic basis and molecular pathophysiology of classical myeloproliferative neoplasms. Blood. 2017 Feb 9;129(6):667-679.
                </Text>
                <Text>
                {'  '}7.	Classification and Personalized Prognosis in Myeloproliferative Neoplasms. N Engl J Med. 2018 Oct 11;379(15):1416-1430.
                </Text>
                <Text>
                {'\n\n'}
				</Text>
                <View style={styles.containInfoView}>
					<Text style={{ width: 263, fontFamily: 'KAIU' }}>品質主管：{prop.memberlist.find((element)=>element.workerId===prop.data.qualityManager)?.name} 醫檢師{'\n'}{'\t\t\t\t\t\t\t\t\t\t'}中檢專字{prop.memberlist.find((element)=>element.workerId===prop.data.qualityManager)?.number}號</Text>
					<Text style={{ width: 263, fontFamily: 'KAIU' }}>報告醫師：{prop.memberlist.find((element)=>element.workerId===prop.data.reportDoctor)?.name} 主治醫師{'\n'}{'\t\t\t\t\t\t\t\t\t\t'}中血專字{prop.memberlist.find((element)=>element.workerId===prop.data.reportDoctor)?.number}號</Text>
				</View>
                <Text>
                {'\n'}
				</Text>
                <View style={styles.containInfoView}>
					<Text style={{ width: 263, fontFamily: 'KAIU' }}>檢 查 者：{prop.memberlist.find((element)=>element.workerId===prop.data.checker)?.name} 醫檢師{'\n'}{'\t\t\t\t\t\t\t\t\t\t'}中檢專字{prop.memberlist.find((element)=>element.workerId===prop.data.checker)?.number}號</Text>
					<Text style={{ width: 263, fontFamily: 'KAIU' }}>確 認 者：{prop.memberlist.find((element)=>element.workerId===prop.data.confirmer)?.name} 主治醫師{'\n'}{'\t\t\t\t\t\t\t\t\t\t'}中血專字{prop.memberlist.find((element)=>element.workerId===prop.data.confirmer)?.number}號</Text>
				</View>
                <Text>
                {'\n'}
				</Text>
                <View style={styles.containInfoView}>
					<Text style={{ width: 263, fontFamily: 'KAIU' }}>確認日期：{`${new Date(Date.now()).getFullYear()}/${(new Date(Date.now()).getMonth() > 8) ? (new Date(Date.now()).getMonth() + 1) : ('0' + (new Date(Date.now()).getMonth() + 1))}/${(new Date(Date.now()).getDate() > 9) ? new Date(Date.now()).getDate() : ('0' + new Date(Date.now()).getDate())}`}</Text>
				</View>
			</View>
			<View style={styles.footerView} fixed>
				<Text style={{marginTop:8}}>西元2023年03月03日病歷委員會修正通過電子病歷版本 MR 08-13-39</Text>
				<View style={{...styles.table, width:210, marginLeft:2}}>
					<View style={styles.tableRow}>
						<View style={{...styles.tableCol, width: '25%'}}>
							<Text style={{...styles.tableCell, textAlign: 'center'}}>文件編號</Text>
						</View>
						<View style={{...styles.tableCol, width: '41%'}}>
							<Text style={{...styles.tableCell, textAlign: 'center'}}>01400-4-602666</Text>
						</View>
						<View style={{...styles.tableCol, width: '17%'}}>
							<Text style={{...styles.tableCell, textAlign: 'center'}}>版次</Text>
						</View>
						<View style={{...styles.tableCol, width: '17%'}}>
							<Text style={{...styles.tableCell, textAlign: 'center'}}>03</Text>
						</View>
					</View>
				</View>
			</View>
			<View style={styles.footerVersionView} fixed>
				<Text style={{marginLeft:2, fontSize:20, borderStyle: 'solid', borderWidth: 2, borderRadius: "50%", height:25, width:25, textAlign:'center', paddingTop:2}}>3</Text>
			</View>
            

		</Page>
	</Document>
);

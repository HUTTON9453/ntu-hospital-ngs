import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, FormGroup, Radio, RadioGroup } from '@material-ui/core';
import React, { FunctionComponent, useState, useEffect } from 'react';
import { Orders } from '../../models/orders.enum';
import { ApiUrl } from '../../constants/constants';
import { ExportDataToCsv } from '../../utils/exportDataToCsv';
import axios from 'axios';


type ExportModalProps = {
    show: boolean;
    exportData: Array<any>;
    exportCoverageData: Array<any>;
    onClose: () => void;
};

const headers = [
    { label: 'SID', key: 'SID' },
	{ label: 'Sample Name', key: 'sampleName'},
	{ label: 'Chr', key: 'chr' },
	{ label: 'Position', key: 'position' },
	{ label: 'dbSNP', key: 'dbSNP' },
	{ label: 'Freq', key: 'freq' },
	{ label: 'Depth', key: 'depth' },
	{ label: 'Annotation', key: 'annotation' },
	{ label: 'Gene_Name', key: 'geneName' },
	{ label: 'HGVS.c', key: 'HGVSc' },
	{ label: 'HGVS.p', key: 'HGVSp' },
	{ label: 'Clinical significance', key: 'clinicalSignificance' },
	{ label: 'Global_AF', key: 'globalAF' },
	{ label: 'AFR_AF', key: 'AFRAF' },
	{ label: 'AMR_AF', key: 'AMRAF' },
	{ label: 'EUR_AF', key: 'EURAF' },
    { label: 'ASN_AF', key: 'ASNAF' },
    { label: 'Remark', key: 'alert' },
    { label: 'Assay', key: 'Assay' },
    { label: 'P/N', key: 'PN' },
];
export const ExportModal: FunctionComponent<ExportModalProps> = (props) => {
    const [ step, setStep] = useState<number>(0)
    const now = new Date(Date.now())

    const [ template, setTemplate] = useState<number>(0)
    const LISHeader = {
        sampleName: false,
        chr: false,
        position:false,
        dbSNP: false,
        freq:true,
        depth:false,
        annotation:false,
        geneName:true,
        HGVSc: true,
        HGVSp: true,
        clinicalSignificance: false,
        globalAF: false,
        AFRAF: false,
        AMRAF: false,
        EURAF: false,
        ASNAF: false,
        alert: false,
        SID: true,
        Assay: true,
        PN: true
    }
    const [ header, setHeader] = useState({
        sampleName: true,
        chr: true,
        position:true,
        dbSNP: true,
        freq:true,
        depth:true,
        annotation:true,
        geneName:true,
        HGVSc:  true,
        HGVSp: true,
        clinicalSignificance: true,
        globalAF: true,
        AFRAF: true,
        AMRAF: true,
        EURAF: true,
        ASNAF: true,
        alert: false,
        SID: false,
        Assay: false,
        PN: false
    })
    useEffect(()=>{
        setStep(0);
        setTemplate(0);
    },[props.show])

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setHeader({ ...header, [event.target.name]: event.target.checked });
      };

    const getAssay = (geneName: string, HGVSp: string) => {
        if(geneName == 'JAK2') {
            let matchResult = HGVSp.match(/\d+/);
            if(matchResult != null) {
                let HGVSpNumber = parseInt(matchResult[0]);
                if (HGVSpNumber >= 505 && HGVSpNumber <= 547) {
                    return Orders['JAK2_505547'];
                } else if (HGVSpNumber >= 593 && HGVSpNumber <= 622) {
                    return Orders['JAK2_593622'];
                } else {
                    return null;
                }
            } else {
                return; 
            }
        } else {
            return Orders[geneName];
        }
    }

    const handleExportLIE = async (header: any[], rowData: any[]) => {
        try {
			await axios.post(`${ApiUrl}/api/downloadliscsv`, {
                rowData: rowData,
				header: header,
			});
		} catch (error) {
			console.log(error);
		} finally{
			props.onClose();
        }
    }

    const LISDataFilter = (exportData: Array<any>, exportCoverageData: Array<any>) => {
        const dataGroupBySampleId = exportData.reduce((group, data) => {
            const sampleId = data.sample.sampleId;
            group[sampleId] = group[sampleId] ?? [];
            group[sampleId].push(data);
            return group;
        }, {});

        const coverageDataGroupBySampleId = exportCoverageData.reduce((group, data) => {
            const sampleId = data.sample.sampleId;
            group[sampleId] = group[sampleId] ?? [];
            group[sampleId].push(data);
            return group;
        }, {});

        Object.keys(dataGroupBySampleId).map(key => {
            // 該 SID 中沒對到醫令的資料
            dataGroupBySampleId[key].filter(data => !getAssay(data.geneName, data.HGVSp)).map(data => {
                data.SID = data.sample.SID;
                data.Assay = 'NA'
                data.PN = !['Pathogenic', 'VUS'].includes(data.clinicalSignificance)  ? 'N' : 'P';
                return data;
            })

            Object.keys(Orders).map(order => {
                let targetDatas = dataGroupBySampleId[key].filter(data => getAssay(data.geneName, data.HGVSp) == Orders[order])
                // 對應到該醫令的 coverage data
                let targetCoverageDatas = coverageDataGroupBySampleId[key].filter(coverageData => {
                    if (order == 'JAK2_505547') {
                        return coverageData.amplionName == 'JAK2-ex12.1'
                    } else if (order == 'JAK2_593622') {
                        return coverageData.amplionName == 'JAK2-ex14.1'
                    } else {
                        return coverageData.amplionName.startsWith(order)
                    }
                })
                let meanCoverage = targetCoverageDatas.reduce((a, b) => a + b.amplion_mean_coverge, 0) / targetCoverageDatas.length;

                if (targetDatas.length > 0) {
                    // 該 sample 中有該醫令的資料
                    if (meanCoverage > 250) {
                        targetDatas.map(data => {
                            const assay = getAssay(data.geneName, data.HGVSp);
                            data.SID = data.sample.SID;
                            data.Assay = assay
                            data.PN = !['Pathogenic', 'VUS'].includes(data.clinicalSignificance)  ? 'N' : 'P';
                            return data;
                        })
                    } else {
                        targetDatas.map(data => {
                            data.SID = data.sample.SID;
                            data.Assay = getAssay(data.geneName, data.HGVSp);
                            data.HGVSc = 'NA'
                            data.HGVSp = 'NA'
                            data.freq = 'NA'
                            data.PN = 'NA'
                            return data;
                        })
                    }
                } else {
                    // 該 sample 中沒有該醫令的資料
                    let newData = {
                        SID: key,
                        geneName: order.startsWith('JAK2') ? 'JAK2' : order,
                        HGVSc: 'NA',
                        HGVSp: 'NA',
                        freq: 'NA',
                        Assay: Orders[order],
                    }
                    newData['PN'] = meanCoverage > 250 ? 'N' : 'NA'
                    dataGroupBySampleId[key].push(newData)
                }
            })
        });

        return Object.values(dataGroupBySampleId).flat(Infinity);
    }

	return (
		<Dialog maxWidth="xl" open={props.show} onClose={props.onClose}>
			<DialogTitle>Select export Template</DialogTitle>
			<DialogContent dividers >
                {(()=>{
                     switch (step) {
                        case 0:
                            return (
                                <RadioGroup row aria-label="position" name="position" defaultValue="top">
                                    <FormControlLabel
                                    value="0"
                                    control={<Radio color="primary" checked={template===0} />}
                                    onChange={()=>setTemplate(0)}
                                    label="自選欄位"
                                    labelPlacement="top"
                                    />
                                    <FormControlLabel
                                    value="1"
                                    control={<Radio color="primary" checked={template===1}/>}
                                    onChange={()=>setTemplate(1)}
                                    label="LIS 套版"
                                    labelPlacement="top"
                                    />
                                </RadioGroup>)
                        case 1:
                            return (
                                <FormGroup>
                                    {
                                        headers.map((h)=>
                                            h.key!=='alert'?
                                            <FormControlLabel
                                                control={<Checkbox checked={header[h.key]} onChange={handleChange} name={h.key} />}
                                                label={h.label}
                                            />:null
                                        )
                                    }

                                </FormGroup>
                            )
                     }
                    })()
                }
      
        
            </DialogContent>
			<DialogActions>
                { step===0&&template===0?
				<Button onClick={()=>setStep(1)} color="primary">
					確認
                </Button>:(template===1?
                <Button onClick={()=>handleExportLIE(headers.filter((h)=>LISHeader[h.key]), LISDataFilter(props.exportData, props.exportCoverageData))}>
                    匯出
                </Button>:
                <ExportDataToCsv fileName={`${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}-${now.getHours()}.csv`} data={props.exportData.map((d)=>{
                    d.sampleName = d.sample.sampleName;
                    return d;
                })} onClose={props.onClose} headers={headers.filter((h)=>header[h.key])}>
                    匯出
                </ExportDataToCsv>)
                }
				<Button onClick={props.onClose} color="primary">
					取消
				</Button>
			</DialogActions>
		</Dialog>
	);
};
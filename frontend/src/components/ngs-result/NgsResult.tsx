import React, { FunctionComponent, useContext, useEffect, useState } from 'react';
import { Title } from '../title/Title';
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	AppBar,
	Backdrop,
	Box,
	Button,
	Checkbox,
	CircularProgress,
	createStyles,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Fab,
	Grid,
	Input,
	makeStyles,
	Paper,
	Select,
	Tab,
	TextField,
	Theme,
	Typography,
	useScrollTrigger,
	Zoom
} from '@material-ui/core';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem, { TreeItemProps } from '@material-ui/lab/TreeItem';
import ImportExportIcon from '@material-ui/icons/ImportExport';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import DeleteIcon from '@material-ui/icons/Delete';
import { Segment } from '../../models/segment.model';
import { Sample } from '../../models/sample.model';
import axios from 'axios';
import EditIcon from "@material-ui/icons/EditOutlined";
import KeyboardArrowUpIcon  from '@material-ui/icons/KeyboardArrowUp';
import AddIcon from '@material-ui/icons/Add';
import { ApiUrl } from '../../constants/constants';
import DescriptIcon from '@material-ui/icons/Description';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import { SegmentTable } from '../table/SegmentTable';
import { SegmentTagContext } from '../../contexts/segmentTag.context';
import { ExportModal } from '../modals/ExportModal';
import { UploadFolderModal } from '../modals/UploadFolderModal';
import { EditDiseaseModal } from '../modals/EditDiseaseModal';
import TabPanel from '@material-ui/lab/TabPanel';
import TabContext from '@material-ui/lab/TabContext';
import TabList from '@material-ui/lab/TabList';
import { Coverage } from '../../models/coverage.model';
import { MutationQC } from '../../models/mutationQC.model';
import { CoverageTable } from '../table/CoverageTable';
import { MutationQCCollapsibleTable } from '../table/MutationQCCollapsibleTable';
import { ResultContext } from '../../contexts/result.context';
import useCookies from 'react-cookie/cjs/useCookies';
import { AddSegmentTagModal } from '../modals/AddSegmentTagModal';
import { Run } from '../../models/run.model';
import { EditRunDateModal } from '../modals/EditRunDateModal';
import { AnalysisSummaryTable } from '../table/AnalysisSummaryTable';
import { Aligned } from '../../models/aligned.model';
import { SegmentCategory } from '../../models/segment.category.enum';
import { QueryBox } from './QueryBox';
import { ResultOptionContext } from '../../contexts/result-option.context';
import { QueryCondition } from '../../models/query.condition.enum';
import { ExportPdfModal } from '../modals/ExportPdfModal';
import { PdfData } from '../../models/pdf.model';
import { ClinicalSignificance } from '../../models/clinicalSignificance.enum';
import { PdfDataContext } from '../../contexts/pdf-data.context';
import igv from 'igv';

import { Font } from '@react-pdf/renderer';
import KAIU from '../../font/KAIU.TTF';
import KAIUBold from '../../font/KAIUBold.TTF';
import TimesNewRoman from '../../font/TimesNewRoman.TTF';
import TimesNewRomanBold from '../../font/TimesNewRomanBold.TTF';
const fs = require("fs");
const atob = require("atob");
declare module 'csstype' {
	interface Properties {
		'--tree-view-color'?: string;
		'--tree-view-bg-color'?: string;
	}
}

type StyledTreeItemProps = TreeItemProps & {
	bgColor?: string;
	color?: string;
	labelInfo?: string;
	labelText: string;
	handleSelectClick: (event: React.ChangeEvent, id: number, isSample: boolean) => void;
	isSample: boolean;
	isSelected?: boolean;
	rowCount: number;
	numSelected: number;
	labelInfoClickListener?;
};
var igvStyle = {
    paddingTop: '10px',
    paddingBottom: '10px',
    margin: '8px',
	width: '60vw'

}
const useTreeItemStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			color: theme.palette.text.secondary,
			userSelect: 'none',
			'&:hover > $content': {
				backgroundColor: theme.palette.action.hover
			},

			'&:focus > $content, &$selected > $content': {
				backgroundColor: `var(--tree-view-bg-color, ${theme.palette.grey[400]})`,
				color: 'var(--tree-view-color)'
			},
			'&:focus > $content $label, &:hover > $content $label, &$selected > $content $label': {
				backgroundColor: 'transparent'
			}
		},
		content: {
			color: theme.palette.text.secondary,
			borderTopRightRadius: theme.spacing(2),
			borderBottomRightRadius: theme.spacing(2),
			paddingRight: theme.spacing(1),
			fontWeight: theme.typography.fontWeightMedium,
			'$expanded > &': {
				fontWeight: theme.typography.fontWeightRegular
			}
		},
		group: {
			marginLeft: 0,
			'& $content': {
				paddingLeft: theme.spacing(2)
			}
		},
		expanded: {},
		selected: {},
		label: {
			fontWeight: 'inherit',
			color: 'inherit'
		},
		labelRoot: {
			display: 'flex',
			alignItems: 'center',
			padding: theme.spacing(0.5, 0)
		},
		labelIcon: {
			marginRight: theme.spacing(1)
		},
		labelText: {
			fontWeight: 'inherit',
			flexGrow: 1
		}
	})
);

  function StyledTreeItem(props: StyledTreeItemProps) {
	const classes = useTreeItemStyles();
	const { labelText, labelInfo, color, bgColor, nodeId, isSample, handleSelectClick, isSelected, rowCount, numSelected, labelInfoClickListener, ...other } = props;
  
	return (
	  <TreeItem
		label={
		  <div className={classes.labelRoot} onDoubleClick={labelInfoClickListener}>
			  <Checkbox 
			  	id = {nodeId}
				checked={isSelected}
				indeterminate={numSelected > 0 && numSelected < rowCount}
				onClick={e => (e.stopPropagation())}
				onChange={(event)=>handleSelectClick(event, parseInt(nodeId), isSample)}
				inputProps={{ 'aria-labelledby': nodeId }}
		  		/>
			<Typography variant="body2" className={classes.labelText}>
			  {labelText}
			</Typography>
			<Typography variant="caption" color="inherit">
			  {labelInfo}
			</Typography>
		  </div>

		}
		style={{
		  '--tree-view-color': color,
		  '--tree-view-bg-color': bgColor,
		}}
		classes={{
		  root: classes.root,
		  content: classes.content,
		  expanded: classes.expanded,
		  selected: classes.selected,
		  group: classes.group,
		  label: classes.label,
		}}
		nodeId={nodeId}
		{...other}
	  />
	);
  }

  const useStyles2 = makeStyles((theme) => ({
	root: {
	  position: 'fixed',
	  bottom: theme.spacing(2),
	  right: theme.spacing(2),
	},
  }));


  const useStyles3 = makeStyles((theme) => ({
	root: {
	  position: 'fixed',
	  bottom: theme.spacing(8),
	  right: theme.spacing(2),
	},
  }));

  function ShowIGV(props){
	const { children, window } = props;
	const classes = useStyles3();
	const handleClick = (event) =>{
		
	};
	return (
		  <div onClick={handleClick} role="presentation" className={classes.root}>
			{children}
		  </div>
	  );
  }
  
  function ScrollTop(props) {
	const { children, window } = props;
	const classes = useStyles2();
	// Note that you normally won't need to set the window ref as useScrollTrigger
	// will default to window.
	// This is only being set here because the demo is in an iframe.
	const trigger = useScrollTrigger({
	  target: window ? window() : undefined,
	  disableHysteresis: true,
	  threshold: 100,
	});
  
	const handleClick = (event) => {
	  const anchor = (event.target.ownerDocument || document).querySelector('#back-to-top-anchor');
  
	  if (anchor) {
		anchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
	  }
	};
  
	return (
	  <Zoom in={trigger}>
		<div onClick={handleClick} role="presentation" className={classes.root}>
		  {children}
		</div>
	  </Zoom>
	);
  }
  


const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		paper: {
			paddingTop: theme.spacing(2),
			paddingBottom: theme.spacing(2),
			marginTop: theme.spacing(2),
			marginBottom: theme.spacing(2),
			width: '64vw'
		},
		root: {
			maxHeight: '80vh',
			overflow: 'auto',
			flexGrow: 1
		},
		formControl: {
			margin: theme.spacing(1),
			minWidth: 100
		},
		iconGroup: {
			width: 'fit-content',
			border: `1px solid ${theme.palette.divider}`,
			borderRadius: theme.shape.borderRadius,
			backgroundColor: theme.palette.background.paper,
			color: theme.palette.text.secondary,
			'& svg': {
				margin: theme.spacing(1.5)
			},
			'& hr': {
				margin: theme.spacing(0, 0.5)
			}
		},
		textField: {
			marginLeft: theme.spacing(1),
			marginRight: theme.spacing(1),
			width: 200,
		},
		backdrop: {
			zIndex: theme.zIndex.drawer + 1,
			color: '#fff'
		},
		igvStyle:{
			position:'fixed',
			bottom: theme.spacing(2),
			left: '50%',
			width: '64vw',
			marginLeft: '-30vw',
		}
	})
);
export const NgsResult: FunctionComponent = (prop) => {
	const classes = useStyles();
	const { refresh,sampleResults, segmentResults, coverageResults, mutationQCResults, alignedResults,setSegments, setAligneds, setMutationQCs, setCoverages, setSamples } = useContext(ResultContext);
	const { blacklist, whitelist, filterlist, hotspotlist, selectedTarget, selectedOther, setSelectedTarget, setSelectedOther, addBlacklist, addWhitelist } = useContext(SegmentTagContext);
	const { input, condition } = useContext(ResultOptionContext);
	const { pdfData,  setData} = useContext(PdfDataContext);
	const [ targetSegments, setTargetSegments ] = useState(Array<Segment>());
	const [ otherSegments, setOtherSegments ] = useState(Array<Segment>());
	const [ selectedSegments, setSelectedSegments ] = useState<Array<Segment>>(new Array<Segment>());
	const [ selectedAddSegments, setSelectedAddSegments ] = useState<Array<Segment>>(new Array<Segment>());
	const [ selectedCoverages, setSelectedCoverages ] = useState<Array<Coverage>>(new Array<Coverage>());
	const [ selectedAligneds, setSelectedAligneds ] = useState<Array<Aligned>>(new Array<Aligned>());
	const [ selectedMutationQCs, setSelectedMutationQCs ] = useState<Array<MutationQC>>(new Array<MutationQC>());
	const [ selectedSample, setSelectedSample ] = useState<Sample>(new Sample());
	const [ selectedRun, setSelectedRun ] = useState<Run>(new Run());
	const [ showModal, setShowModal ] = useState<boolean>(false);
	const [ showExportPdfModal, setShowExportPdfModal ] = useState<boolean>(false);
	const [ showUploadModal, setShowUploadModal ] = useState<boolean>(false);
	const [ showAddSegmentModal, setShowAddSegmentModal ] = useState<boolean>(false);
	const [ title, setTitle ] = useState<string>("blacklist");
	const [ showEditDiseaseModal, setShowEditDiseaseModal ] = useState<boolean>(false);
	const [ showEditRunDateModal, setShowEditRunDateModal ] = useState<boolean>(false);
	const [ showConfirmDialog, setShowConfirmDialog ] = useState<boolean>(false);
	const [ isEditable, setIsEditable ] = useState<boolean>(false);
	const [ isAdd, setIsAdd ] = useState<boolean>(false);
	const [ selected, setSelected ] = React.useState<number[]>([]);
	const [ selectedRunId, setSelectedRunId ] = React.useState<number[]>([]);
	const [ exportData, setExportData ] = useState<Segment[]>([]);
	const [ exportCoverageData, setExportCoverageData ] = useState<Coverage[]>([]);

	const [ exportPdfData, setExportPdfData ] = useState<any>([]);
	const [ value, setValue ] = React.useState('1');
	const [ igvHidden, setIgvHidden] = React.useState(true);


	const [ track, setTrack ] = React.useState({
		"name": "",
		"sourceType": "file",
		"url": "",
		"indexURL": "",
		"type": 'alignment',
		"format": 'bam',
	});

	const [ cookies ] = useCookies();
	Font.register({ family: 'KAIU', src: KAIU });
	Font.register({ family: 'KAIUBold', src: KAIUBold });
	//Font.register({ family: 'TimesNewRoman', src: TimesNewRoman });
	//Font.register({ family: 'TimesNewRomanBold', src: TimesNewRomanBold });
	// disable hyphenation
	Font.registerHyphenationCallback((word: string) => {
		// Return word syllables in an array
		const splittedWord = word.split('');
		const result = [] as string[];
		for (const l of splittedWord) {
		  result.push(l, '');
		}
		return result;
		/*if (word.length === 1) {
		  return [word];
		}   
	
		return Array.from(word)
		  .map((char) => [char, ''])
		  .reduce((arr, current) => {
			arr.push(...current);
			return arr;
		  }, []);*/
	  });
	/*Font.registerHyphenationCallback((word: string) => {
		if (word.length === 1) {
		  return [word];
		}   
	
		return Array.from(word)
		  .map((char) => [char, ''])
		  .reduce((arr, current) => {
			arr.push(...current);
			return arr;
		  }, []);
	  });*/
	useEffect(()=>{
        var igvContainer = document.getElementById('igv-div');
		var igvOptions;
		if (track.name!==""){
			igvOptions = { genome: "hg19","tracks":track,
			"locus": 'chr11:32449420'};
		}
			
		else{
			igvOptions = { genome: "hg19","name": "",
			"sourceType": "file",
			"url": "",
			"indexURL": "",
			"type": 'alignment',
			"format": 'bam',
			"locus": 'chr11:32449420'};
		}
			
		
		igv.createBrowser(igvContainer, igvOptions).
			then(function (browser) {
				igv.browser = browser;
		});
    },[]);

	useEffect(
		() => {			
			setIsEditable(false);
			setIsAdd(false);
			
		},
		[ selectedSegments ]
	);
	useEffect(
		() => {			
			if (track.name!==""){
				igv.browser.removeTrackByName(track.name);
				igv.browser.loadTrack(track);
			}
				
		},
		[ track, value ]
	);


	useEffect(
		() => {
			const [ tempOther, tempTarget ] = filterSegments(selectedSegments);
			setOtherSegments(tempOther);
			setTargetSegments(tempTarget);
		},
		[ selectedSegments, blacklist, whitelist, isEditable ]
	);

	const handleTabChange = (event: React.ChangeEvent<{}>, newValue: string) => {
		setValue(newValue);
	};

	const handleUploadClick = () => {
		setShowUploadModal(true);
	};

	const handleSelectClick = (event: React.ChangeEvent, id: number, isSample: boolean) => {
		let newSelected: number[] = [];
		let newSelectedRunId: number[] = [];
		let runIsSelected: boolean = Boolean(1);

		if (isSample) {
			const selectedIndex = selected.indexOf(id);
			const runId = segmentResults[id][0].sample.run.runId;
			let ids: number[] = sampleResults[runId].map((sample) => sample.sampleId);
			ids.forEach((element) => {
				runIsSelected = runIsSelected && selected.indexOf(element as number) !== -1;
			});
			if (runIsSelected) {
				const selectedRunIdIndex = selectedRunId.indexOf(runId);
				if (selectedRunIdIndex === -1) {
					newSelectedRunId = newSelectedRunId.concat(selectedRunId, runId);
				} else if (selectedRunIdIndex === 0) {
					newSelectedRunId = newSelected.concat(selectedRunId.slice(1));
				} else if (selectedRunIdIndex === selectedRunId.length - 1) {
					newSelectedRunId = newSelectedRunId.concat(selectedRunId.slice(0, -1));
				} else if (selectedRunIdIndex > 0) {
					newSelectedRunId = newSelectedRunId.concat(
						selectedRunId.slice(0, selectedRunIdIndex),
						selectedRunId.slice(selectedRunIdIndex + 1)
					);
				}
				setSelectedRunId(newSelectedRunId);
			}
			
			if (selectedIndex === -1) {
				newSelected = newSelected.concat(selected, id);
			} else if (selectedIndex === 0) {
				newSelected = newSelected.concat(selected.slice(1));
			} else if (selectedIndex === selected.length - 1) {
				newSelected = newSelected.concat(selected.slice(0, -1));
			} else if (selectedIndex > 0) {
				newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
			}
		} else {
			let ids: number[] = sampleResults[id].map((sample) => sample.sampleId);
			ids.forEach((element) => {
				runIsSelected = runIsSelected && selected.indexOf(element as number) !== -1;
			});
			if (runIsSelected) {
				newSelected = selected.filter((id) => ids.indexOf(id) === -1);
			} else {
				newSelected = newSelected.concat(selected, ids.filter((id) => selected.indexOf(id) === -1));
			}
			const selectedIndex = selectedRunId.indexOf(id);
			if (selectedIndex === -1) {
				newSelectedRunId = newSelectedRunId.concat(selectedRunId, id);
			} else if (selectedIndex === 0) {
				newSelectedRunId = newSelected.concat(selectedRunId.slice(1));
			} else if (selectedIndex === selectedRunId.length - 1) {
				newSelectedRunId = newSelectedRunId.concat(selectedRunId.slice(0, -1));
			} else if (selectedIndex > 0) {
				newSelectedRunId = newSelectedRunId.concat(
					selectedRunId.slice(0, selectedIndex),
					selectedRunId.slice(selectedIndex + 1)
				);
			}
			setSelectedRunId(newSelectedRunId);
		}
		setSelected(newSelected);
	};
	const isSelected = (id: number | number[], isSample: boolean) => {
		if (isSample) {
			return selected.indexOf(id as number) !== -1;
		} else {
			let runIsSelected: boolean = Boolean(1);
			(id as number[]).forEach((element) => {
				runIsSelected = runIsSelected && selected.indexOf(element as number) !== -1;
			});

			return runIsSelected;
		}
	};
	
	const handleBlacklistAdd = async (segments: Segment[]) => {
		try {
			await axios.post(`${ApiUrl}/api/addBlacklist`, {
				data: segments
			});
		} catch (error) {
			console.log(error);
		} finally {
			addBlacklist(segments, cookies['user-name']);
			setSelectedTarget([]);
			setSelectedOther([]);
		}
	};
	const handleWhitelistAdd = async (segments: Segment[]) => {
		try {
			await axios.post(`${ApiUrl}/api/addWhitelist`, {
				data: segments
			});
		} catch (error) {
			console.log(error);
		} finally {
			addWhitelist(segments, cookies['user-name']);
			setSelectedTarget([]);
			setSelectedOther([]);
		}
	};
	function filterSegments(segments) {
		let tempOther = Array<Segment>();
		let tempTarget = Array<Segment>();
		if (segments) {
			segments.forEach((segment) => {
				if (
					filterlist.findIndex(
						(tag) => tag.id === `${segment.chr}_${segment.position}_${segment.HGVSc}_${segment.HGVSp}`
					) !== -1
				) {
					return;
				}
				if (
					hotspotlist.findIndex(
						(tag) => segment.HGVSp.indexOf(tag.HGVSp) !==-1 && segment.geneName === tag.geneName
					) !== -1 && segment.freq > 1
				) {
					const finding = hotspotlist.find((tag) => segment.HGVSp.indexOf(tag.HGVSp) !==-1 && segment.geneName === tag.geneName)
					segment.clinicalSignificance = finding?.clinicalSignificance;
					segment.remark = finding?.remark;
					
					if (segment.editor&&segment.category==="Target"){
						tempTarget.push(segment);
					}else if (segment.editor&&segment.category==="Other"){
						tempOther.push(segment);
					}else{
						segment.editor = finding?.editor;
						segment.category="Target";
						tempTarget.push(segment);
					}
				}
				else if (
					blacklist.findIndex(
						(tag) => tag.id === `${segment.chr}_${segment.position}_${segment.HGVSc}_${segment.HGVSp}`
					) !== -1
				) {
					const finding = blacklist.find((tag) => tag.id === `${segment.chr}_${segment.position}_${segment.HGVSc}_${segment.HGVSp}`)
					segment.remark = finding?.remark;
					segment.clinicalSignificance = finding?.clinicalSignificance;
					if (segment.editor&&segment.category==="Target"){
						tempTarget.push(segment);
					}else if (segment.editor&&segment.category==="Other"){
						tempOther.push(segment);
					}else{
						segment.editor = finding?.editor;
						segment.category="Other";
						tempOther.push(segment);
					}
					
				}
				else if (
					whitelist.findIndex(
						(tag) => tag.id === `${segment.chr}_${segment.position}_${segment.HGVSc}_${segment.HGVSp}`
					) !== -1
				) {
					const finding = whitelist.find((tag) => tag.id === `${segment.chr}_${segment.position}_${segment.HGVSc}_${segment.HGVSp}`)
					segment.remark = finding?.remark;
					segment.clinicalSignificance = finding?.clinicalSignificance;
					if (segment.editor&&segment.category==="Target"){
						tempTarget.push(segment);
					}else if (segment.editor&&segment.category==="Other"){
						tempOther.push(segment);
					}else{
						segment.editor = finding?.editor;
						segment.category="Target";
						tempTarget.push(segment);
					}
					
				}else if (segment.category==="Target"){
					tempTarget.push(segment);
				}else if (segment.category==="Other"){
					tempOther.push(segment);
				}
			});
		}

		return [ tempOther, tempTarget ];
	}
	const handleDoubleClick = (sample: Sample) => {
		setSelectedSample(sample);
		setShowEditDiseaseModal(true);
	};

	const handleRunDoubleClick = (run: Run) => {
		setSelectedRun(run);
		setShowEditRunDateModal(true);
	};
	  
	  
	const handleClick = (segments: Segment[], sample: Sample) => {
		let bam = "";
		let bai = "";
		setSelectedSegments(segments);
		setSelectedSample(sample);
		if (mutationQCResults[sample.sampleId]) setSelectedMutationQCs(mutationQCResults[sample.sampleId]);
		else setSelectedMutationQCs([]);
		if (coverageResults[sample.sampleId]) setSelectedCoverages(coverageResults[sample.sampleId]);
		else setSelectedCoverages([]);
		if (alignedResults[sample.sampleId]) setSelectedAligneds(alignedResults[sample.sampleId]);
		else setSelectedAligneds([]);
		if (track.name!==""){
			igv.browser.removeTrackByName(track.name);
		}
			
		setTrack({
			"name": sample.sampleName.split("_")[0],
			"sourceType": "file",
			"url": `/file/${sample.bed}/${sample.run.runName.replace('/','-')}/BAM/${sample.sampleName}.bam`,
			"indexURL": `/file/${sample.bed}/${sample.run.runName.replace('/','-')}/BAM/${sample.sampleName}.bam.bai`,
			"type": 'alignment',
			"format": 'bam',
		});
		
	};

	const handleBlacklistAddClick = () => {
		setSelectedAddSegments(selectedTarget.concat(selectedOther));
		setTitle("blacklist");
		setShowAddSegmentModal(true);
	};

	const handleWhitelistAddClick = () => {
		setSelectedAddSegments(selectedTarget.concat(selectedOther));
		setTitle("whitelist");
		setShowAddSegmentModal(true);
	};

	const handleExportPdfClick = () => {
		setExportPdfData(getExportPdfData());
		setShowExportPdfModal(true);
	};

	const handleExportClick = () => {
		setExportData(getExportData());
		setShowModal(true);
	};
	const handleDeleteClick = async () => {
		try {
			const response = await axios.post(`${ApiUrl}/api/deleteSamples`, {
				data: { sampleIds: selected, runIds: selectedRunId }
			});
			setSamples(response.data);
		} catch (error) {
			console.log(error);
		} finally {
			setShowConfirmDialog(false);
		}
	};

	const handleSampleChange =  (e) => {
		// const value = e.target.value;
		const value = e.target.value.trim();
		const name = e.target.name;
		selectedSample[name] = value;
		if(segmentResults[selectedSample.sampleId]!==undefined)
			segmentResults[selectedSample.sampleId].forEach(result => result['sample'][name] = value)	
		setSelectedSample(selectedSample);
		
	};
	function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
		if (b[orderBy] < a[orderBy]) {
			return -1;
		}
		if (b[orderBy] > a[orderBy]) {
			return 1;
		}
		return 0;
	}
	
	type Order = 'asc' | 'desc';
	
	function getComparator<Key extends keyof any>(
		order: Order,
		orderBy: Key
	): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
		return order === 'desc'
			? (a, b) => descendingComparator(a, b, orderBy)
			: (a, b) => -descendingComparator(a, b, orderBy);
	}
	
	function stableSort(array, comparator: (a, b) => number) {
		const stabilizedThis = array.map((el, index) => [ el, index ]);
		
		stabilizedThis.sort((a, b) => {
			const colorOrder = ['Pathogenic', 'Likely Pathogenic', 'VUS', 'Benign'];

    		const aColorIndex = colorOrder.indexOf( a.color );
    		const bColorIndex = colorOrder.indexOf( b.color );
			if ( aColorIndex === bColorIndex ){
				const order = comparator(a[0], b[0]);
				if (order !== 0) return order;
				return a[1] - b[1];
			}
			return aColorIndex - bColorIndex;
		});
		return stabilizedThis.map((el) => el[0]);
	}
	

	const getExportPdfData = () => {
		let newExportData = new Array<PdfData>();
		
		selected.forEach((id: number) => {
			let pdfData = new PdfData();
			if(segmentResults[id]!==undefined){
				let [ tempOther, tempTarget ] = filterSegments(segmentResults[id]);
				pdfData['panel'] =  segmentResults[id][0].sample.bed;
				pdfData['sample'] =  segmentResults[id][0].sample;
				pdfData['runName'] = segmentResults[id][0].sample.run.runName;
				pdfData['sampleName'] = segmentResults[id][0].sample.sampleName;
				pdfData['SID'] = segmentResults[id][0].sample.SID===undefined?"":segmentResults[id][0].sample.SID;
				pdfData['checkDate'] = new Date( segmentResults[id][0].sample.checkDate).toLocaleDateString();
				pdfData['departmentNo'] = segmentResults[id][0].sample.departmentNo===undefined?"":segmentResults[id][0].sample.departmentNo;
				if(alignedResults[id].length>0)
					pdfData['coverage'] = parseFloat((100.0 - alignedResults[id][0].coverRegionPercentage).toFixed(2));
				pdfData['medicalRecordNo'] = segmentResults[id][0].sample.medicalRecordNo===undefined?"":segmentResults[id][0].sample.medicalRecordNo;
				pdfData['patientBirth'] = new Date( segmentResults[id][0].sample.patientBirth).toLocaleDateString();
				pdfData['patientName'] = segmentResults[id][0].sample.patientName===undefined?"":segmentResults[id][0].sample.patientName;
				pdfData['patientSex'] = segmentResults[id][0].sample.patientSex;
				pdfData['specimenNo'] = segmentResults[id][0].sample.specimenNo===undefined?"":segmentResults[id][0].sample.specimenNo;
				pdfData['specimenStatus'] = segmentResults[id][0].sample.specimenStatus===undefined?"":segmentResults[id][0].sample.specimenStatus;
				pdfData['specimenType'] = segmentResults[id][0].sample.specimenType===undefined?"":segmentResults[id][0].sample.specimenType;
				pdfData['note1'] = segmentResults[id][0].sample.note1===undefined?"":segmentResults[id][0].sample.note1;
				pdfData['note2'] = segmentResults[id][0].sample.note2===undefined?"":segmentResults[id][0].sample.note2;
				pdfData['note3'] = segmentResults[id][0].sample.note3===undefined?"":segmentResults[id][0].sample.note3;
				/*
				1. For mutations on hotspot list --> 保留VAF > 1%
				2. For other mutations -->  保留VAF > 3%
				*/
				pdfData['list1'] = stableSort(tempTarget.filter((segment)=>(
					(hotspotlist.findIndex((tag) => segment.HGVSp.indexOf(tag.HGVSp) !==-1 && segment.geneName === tag.geneName) !== -1&&segment.freq>1)
				  ||(hotspotlist.findIndex((tag) => segment.HGVSp.indexOf(tag.HGVSp) !==-1 && segment.geneName === tag.geneName) == -1
				     &&(segment.clinicalSignificance===ClinicalSignificance.Pathogenic || segment.clinicalSignificance===ClinicalSignificance.LikelyPathogenic || segment.clinicalSignificance===ClinicalSignificance.VUS) 
					 && segment.freq>3))
				  && !segment.isDeleted), getComparator("desc", 'freq'));
				/*pdfData['list1'] = tempTarget.filter((segment)=>(segment.clinicalSignificance===ClinicalSignificance.Pathogenic || segment.clinicalSignificance===ClinicalSignificance.LikelyPathogenic) && !segment.isDeleted).map((segment)=>{
					if(segment.freq<5)
						segment.clinicalSignificance=segment.clinicalSignificance+"(low allel frequency)";
					return segment;
				});*/
				//pdfData['list2'] = stableSort(tempTarget.filter((segment)=>hotspotlist.findIndex((tag) => segment.HGVSp.indexOf(tag.HGVSp) !==-1 && segment.geneName === tag.geneName) !== -1 && segment.freq<5 && segment.freq>2 && !segment.isDeleted), getComparator("desc", 'freq'));
				//pdfData['list3'] = stableSort(tempTarget.filter((segment)=>segment.clinicalSignificance===ClinicalSignificance.VUS && segment.freq>2 && !segment.isDeleted), getComparator("desc", 'freq'));
				pdfData['checker'] = segmentResults[id][0].sample.checker;
				pdfData['qualityManager'] = segmentResults[id][0].sample.qualityManager;
				pdfData['reportDoctor'] = segmentResults[id][0].sample.reportDoctor;
				pdfData['confirmer'] = segmentResults[id][0].sample.confirmer;
				let coverageTemplate = coverageResults[id].sort((a, b)=>{
					if(parseInt(a.ampliconStart)<parseInt(b.ampliconStart)){
						return -1;
					}else if(parseInt(a.ampliconStart)>parseInt(b.ampliconStart)){
						return 1;
					}else{
						return 0;
					}
				});

				const testmutationqcs = mutationQCResults[id].reduce((groups, item) => {
					const val = item.geneName;
					groups[val] = groups[val] || [];
					groups[val].push(item);
					return groups;
				}, {})
				let list4 = new Array();
				Object.keys(testmutationqcs).map((key)=>{
					let start = -1;
					let end = -1;
					let lowCodonStart;
					let highCodonStart;
					let lowCodonEnd ;
					let highCodonEnd;
					var r = /\d+/;

					if(key==="CEBPA")
						return;
					testmutationqcs[key].forEach((mutationQC: MutationQC, index, array: MutationQC[]) => {
						
						if(mutationQC.QC<50 && start===-1){
							if(parseInt(mutationQC.position)>=parseInt(coverageTemplate[0].ampliconStart) && parseInt(mutationQC.position)<=parseInt(coverageTemplate[coverageTemplate.length-1].ampliconStart)){
								start = parseInt(mutationQC.position);
								let codonArray = mutationQC.HGVSp.split("_");
								if(codonArray.length>1){
									lowCodonStart = codonArray[0].match(r);
									highCodonStart = codonArray[1].match(r);
									
								}else{
									if(codonArray[0].match(r)!==null){
										lowCodonStart = codonArray[0].match(r);
										highCodonStart = codonArray[0].match(r);
									}else{
										lowCodonStart = 1000000
										highCodonStart = -1
									}
								}

							}
						}
						if(mutationQC.QC<50 && start !==-1){
							if (index === array.length-1){
								if(parseInt(mutationQC.position)<=parseInt(coverageTemplate[coverageTemplate.length-1].ampliconEnd) && parseInt(mutationQC.position)>=parseInt(coverageTemplate[0].ampliconEnd)){
									end = parseInt(mutationQC.position);
									let coverageStartIndex = coverageTemplate.findIndex((r)=>parseInt(r.ampliconStart)>=start)-1;
									let coverageEndIndex = coverageTemplate.findIndex((r)=>parseInt(r.ampliconEnd)>=end);

									let codonArray = mutationQC.HGVSp.split("_");
									if(codonArray.length>1){
										lowCodonEnd = codonArray[0].match(r);
										highCodonEnd = codonArray[1].match(r);
									}else{
										if(codonArray[0].match(r)!==null){
											lowCodonEnd = codonArray[0].match(r);
											highCodonEnd = codonArray[0].match(r);
										}else{
											lowCodonEnd = 1000000
											highCodonEnd = -1
										}
									}
									let codonStart = Math.min(lowCodonStart, lowCodonEnd)===1000000?'?': Math.min(lowCodonStart, lowCodonEnd);
									let condonEnd = Math.max(highCodonStart, highCodonEnd)===-1?'?':Math.max(highCodonStart, highCodonEnd);
									if(coverageStartIndex===coverageEndIndex){
										let exon = coverageTemplate[coverageStartIndex].amplionName.replace("=","-").split('-')[1].split('.')[0];
										list4.push({"gene": key, 'exon': exon, 'from': codonStart, 'to':condonEnd});
									}else{
										let exon = coverageTemplate[coverageStartIndex].amplionName.replace("=","-").split('-')[1].split('.')[0];
										let finalExon = exon;
										for (let i = coverageStartIndex+1; i < coverageEndIndex; i++) {
											const elementExon = coverageTemplate[i].amplionName.replace("=","-").split('-')[1].split('.')[0];
											if(finalExon!==elementExon){
												exon += ", "+elementExon;
												finalExon=elementExon;
											}
										}
										list4.push({"gene": key, 'exon': exon, 'from': codonStart, 'to':condonEnd});
									}
									start = -1;
									 end = -1;
								}
							}else if(array[index+1].QC>50){
								if(parseInt(mutationQC.position)<=parseInt(coverageTemplate[coverageTemplate.length-1].ampliconEnd) && parseInt(mutationQC.position)>=parseInt(coverageTemplate[0].ampliconEnd)){
									end = parseInt(mutationQC.position);
									let coverageStartIndex = coverageTemplate.findIndex((r)=>parseInt(r.ampliconStart)>=start)-1;
									let coverageEndIndex = coverageTemplate.findIndex((r)=>parseInt(r.ampliconEnd)>=end);

									let codonArray = mutationQC.HGVSp.split("_");
									if(codonArray.length>1){
										lowCodonEnd = codonArray[0].match(r);
										highCodonEnd = codonArray[1].match(r);
									}else{
										if(codonArray[0].match(r)!==null){
											lowCodonEnd = codonArray[0].match(r);
											highCodonEnd = codonArray[0].match(r);
										}else{
											lowCodonEnd = 1000000
											highCodonEnd = -1
										}
									}
									let codonStart = Math.min(lowCodonStart, lowCodonEnd)===1000000?'?': Math.min(lowCodonStart, lowCodonEnd);
									let condonEnd = Math.max(highCodonStart, highCodonEnd)===-1?'?':Math.max(highCodonStart, highCodonEnd);
									if(coverageStartIndex===coverageEndIndex){
										let exon = coverageTemplate[coverageStartIndex].amplionName.replace("=","-").split('-')[1].split('.')[0];
										list4.push({"gene": key, 'exon': exon, 'from': codonStart, 'to':condonEnd});
									}else{
										let exon = coverageTemplate[coverageStartIndex].amplionName.replace("=","-").split('-')[1].split('.')[0];
										let finalExon = exon;
										for (let i = coverageStartIndex+1; i < coverageEndIndex; i++) {
											const elementExon = coverageTemplate[i].amplionName.replace("=","-").split('-')[1].split('.')[0];
											if(finalExon!==elementExon){
												exon += ", "+elementExon;
												finalExon=elementExon;
											}
										}
										list4.push({"gene": key, 'exon': exon, 'from': codonStart, 'to':condonEnd});
									}
									start = -1;
									 end = -1;
								}
							}
						}
						
					}); 
				});		
				pdfData['list4'] = list4;	
				newExportData.push(pdfData);	
			}
			
			
			
		});
		setData(newExportData);
		setSelected([]);
		return newExportData;
	};
	const getExportData = () => {
		let newExportData: Segment[] = [];
		let newExportCoverageData: Coverage[] = [];
		selected.forEach((id: number) => {
			let [ tempOther, tempTarget ] = filterSegments(segmentResults[id]);

			// if (mutationQCResults[id]) {
			// 	const fail = mutationQCResults[id]
			// 		.filter((m: MutationQC) => m.QC < 50)
			// 		.map((m: MutationQC) => m.geneName)
			// 		.filter((element, index, arr) => arr.indexOf(element) === index);

			// 	if (tempTarget[0]) {
			// 		tempTarget[0].alert = 'Fail Gene Name: ' + fail.join('; ');
			// 	} else {
			// 		let alert = new Segment();
			// 		alert.alert = 'Fail Gene Name: ' + fail.join('; ');
			// 		tempTarget = [ alert ].concat(tempTarget);
			// 	}
			// }
			newExportCoverageData = newExportCoverageData.concat(coverageResults[id]);
			newExportData = newExportData.concat(tempTarget);
		});
		setExportCoverageData(newExportCoverageData);
		setSelected([]);
		return newExportData;
	};

	const onSaveEditMode =  () => {
		if(isEditable){
			axios.post(`${ApiUrl}/api/updateSegment`, {
				data: segmentResults[selectedSample.sampleId] 
			});
			axios.post(`${ApiUrl}/api/updateSample`, {
				data: selectedSample 
			});
			setSelectedSegments(segmentResults[selectedSample.sampleId])
		}
		setIsEditable(!isEditable);
	};
	
	const onToggleEditMode =  () => {
		setIsEditable(!isEditable);
	};

	const onToggleAddMode =  () => {
		setIsAdd(!isAdd);
	};
	const betweenDate = (date ,inputDate)=>{
		var startTime = new Date(inputDate.split("~")[0]);
		var endTime = new Date(inputDate.split("~")[1]);
		var runDate = new Date(date);
		return runDate >= startTime && runDate <= endTime;
	}


	const renderSampleButtons = () => {
        if(!isAdd && !isEditable){
			return (
				<>
					<Button
						aria-label="edit"
						onClick={onToggleEditMode}
						variant="contained"
						color="default"
						startIcon={<EditIcon />}
						className="mb-1"
					>
						編輯
					</Button>
					<Button
						aria-label="add"
						onClick={onToggleAddMode}
						variant="contained"
						color="default"
						startIcon={<AddIcon />}
						className="mb-1 mx-2"
					>
						加入名單
					</Button>
				</>
			)
		}
		else if (isAdd){
			return(
				<>
					<Button
						onClick={handleBlacklistAddClick}
						variant="contained"
						color="default"
						className="mb-1"
					>
						加到黑名單
					</Button>
					<Button
						onClick={handleWhitelistAddClick}
						variant="contained"
						color="default"
						className="mb-1 mx-2"
					>
						加到白名單
					</Button>
					<Button
						onClick={onToggleAddMode}
						variant="contained"
						color="secondary"
						className="mb-1"
					>
						返回
					</Button>
				</>
			)
		}
		else if (isEditable){
			return (
				<>
					<Button
						onClick={onSaveEditMode}
						variant="contained"
						color="default"
						className="mb-1 mr-2"
					>
						儲存
					</Button>
					<Button
						onClick={onToggleEditMode}
						variant="contained"
						color="secondary"
						className="mb-1"
					>
						返回
					</Button>
				</>

			)
		}
    }

	return (
		<React.Fragment>
			<Title>Results Overview</Title>
			<div className="row">
				<div className="col-3">
					<QueryBox />
					<Grid container alignItems="center" justify="center" className="mt-2">							
						<Grid container alignItems="center" justify="center" xs={6}>
							<Button
								variant="contained"
								color="primary"
								startIcon={<ImportExportIcon />}
								onClick={handleExportClick}
							>
								匯出csv
							</Button>
						</Grid>
						<Grid container alignItems="center" justify="center" xs={6}>
								<Button
									variant="contained"
									color="primary"
									startIcon={<ImportExportIcon />}
									onClick={handleExportPdfClick}
								>
									匯出pdf
								</Button>
						</Grid>
					</Grid>
					<Grid container alignItems="center" justify="center" className="mt-2">							
						<Grid container alignItems="center" justify="center" xs={6}>
							<Button
								variant="contained"
								color="primary"
								startIcon={<DescriptIcon />}
								onClick={handleUploadClick}
							>
								上傳
							</Button>
						</Grid>
						<Grid container alignItems="center" justify="center" xs={6}>
							<Button
								variant="contained"
								color="secondary"
								startIcon={<DeleteIcon />}
								onClick={() => setShowConfirmDialog(true)}
							>
								刪除
							</Button>
						</Grid>
					</Grid>
					<TreeView
						className={classes.root}
						defaultCollapseIcon={<ArrowDropDownIcon />}
						defaultExpandIcon={<ArrowRightIcon />}
						defaultEndIcon={<div style={{ width: 24 }} />}
					>
						{Object.keys(sampleResults).map((key) => ((()=>{
							let len = 0;
							switch(condition){
								case QueryCondition.StartDate:
									len = sampleResults[key].filter((sampleRow)=>betweenDate(sampleRow.run.startTime, input)).length;
									if(len>0)
										return (	
										<StyledTreeItem
											nodeId={String(sampleResults[key][0].run.runId)}
											labelText={sampleResults[key][0].run.runName + '  (' + len + ' records)'}
											labelInfo={new Date(sampleResults[key][0].run.startTime).toLocaleDateString()}
											isSample={false}
											handleSelectClick={handleSelectClick}
											labelInfoClickListener={()=>handleRunDoubleClick(sampleResults[key][0].run)}
											isSelected={isSelected(sampleResults[key].map((sample) => sample.sampleId), false)}
											rowCount={sampleResults[key].length}
											numSelected={sampleResults[key].map((sample) => sample.sampleId).filter((s)=>selected.indexOf(s)===-1).length}
										>
											{sampleResults[key].map((sampleRow: Sample) => (betweenDate(sampleRow.run.startTime, input)?
											<StyledTreeItem
												nodeId={String(sampleRow.sampleId)}
												labelText={sampleRow.sampleName.split('_')[0] + '_' + sampleRow.disease.enName}
												onClick={() =>
													handleClick(segmentResults[sampleRow.sampleId], sampleRow)}
												isSample={true}
												onDoubleClick={() => handleDoubleClick(sampleRow)}
												handleSelectClick={handleSelectClick}
												isSelected={isSelected(sampleRow.sampleId, true)}
												rowCount={0}
												numSelected={0}
											/>:null))}
										</StyledTreeItem>);

								case QueryCondition.SampleName:
									len = sampleResults[key].filter((sampleRow)=> sampleRow.sampleName.split('_')[0].indexOf(input)!==-1).length;
									if(len>0)
										return 	(
										<StyledTreeItem
											nodeId={String(sampleResults[key][0].run.runId)}
											labelText={sampleResults[key][0].run.runName + '  (' + len + ' records)'}
											labelInfo={new Date(sampleResults[key][0].run.startTime).toLocaleDateString()}
											isSample={false}
											handleSelectClick={handleSelectClick}
											labelInfoClickListener={()=>handleRunDoubleClick(sampleResults[key][0].run)}
											isSelected={isSelected(sampleResults[key].map((sample) => sample.sampleId), false)}
											rowCount={sampleResults[key].length}
											numSelected={sampleResults[key].map((sample) => sample.sampleId).filter((s)=>selected.indexOf(s)===-1).length}
										>
											{sampleResults[key].map((sampleRow: Sample) => ((sampleRow.sampleName.split('_')[0].indexOf(input)!==-1)?
											<StyledTreeItem
												nodeId={String(sampleRow.sampleId)}
												labelText={sampleRow.sampleName.split('_')[0] + '_' + sampleRow.disease.enName}
												onClick={() =>
													handleClick(segmentResults[sampleRow.sampleId], sampleRow)}
												isSample={true}
												onDoubleClick={() => handleDoubleClick(sampleRow)}
												handleSelectClick={handleSelectClick}
												isSelected={isSelected(sampleRow.sampleId, true)}
												rowCount={0}
												numSelected={0}
											/>:null))}
										</StyledTreeItem>);
								case QueryCondition.DiseaseEnName:
									len = sampleResults[key].filter((sampleRow)=>sampleRow.disease.enName.indexOf(input)!==-1).length;
									if(len>0)
										return 	(
										<StyledTreeItem
											nodeId={String(sampleResults[key][0].run.runId)}
											labelText={sampleResults[key][0].run.runName + '  (' + len + ' records)'}
											labelInfo={new Date(sampleResults[key][0].run.startTime).toLocaleDateString()}
											isSample={false}
											handleSelectClick={handleSelectClick}
											labelInfoClickListener={()=>handleRunDoubleClick(sampleResults[key][0].run)}
											isSelected={isSelected(sampleResults[key].map((sample) => sample.sampleId), false)}
											rowCount={sampleResults[key].length}
											numSelected={sampleResults[key].map((sample) => sample.sampleId).filter((s)=>selected.indexOf(s)===-1).length}
										>
											{sampleResults[key].map((sampleRow: Sample) => ((sampleRow.disease.enName.indexOf(input)!==-1)?
											<StyledTreeItem
												nodeId={String(sampleRow.sampleId)}
												labelText={sampleRow.sampleName.split('_')[0] + '_' + sampleRow.disease.enName}
												onClick={() =>
													handleClick(segmentResults[sampleRow.sampleId], sampleRow)}
												isSample={true}
												onDoubleClick={() => handleDoubleClick(sampleRow)}
												handleSelectClick={handleSelectClick}
												isSelected={isSelected(sampleRow.sampleId, true)}
												rowCount={0}
												numSelected={0}
											/>:null))}
										</StyledTreeItem>);
							};
						})()))}
					</TreeView>
				</div>
				<div className="col-9" >
					<TabContext value={value}>
						<AppBar position="static" id="back-to-top-anchor">
							<TabList value={value} onChange={handleTabChange}>
								<Tab value="1" label="All Segments" />
								<Tab value="2" label="Sample Coverage" />
								<Tab value="3" label="Mutation QC" />
								<Tab value="4" label="Analysis Summary" />
							</TabList>
						</AppBar>
					
						<TabPanel value="1">
							{renderSampleButtons()}
							<Paper className={classes.paper}>
								<h4 className='row mx-2'>報告基本資料</h4>
								<div className='row mx-2 my-3'>
									<div  className='row col-3'>
										<div  className='col-6 text-right'>
											SID:
										</div>
										<div  className='col-6'>
											{isEditable? 
												<Input
													defaultValue={selectedSample.SID}
													name={'SID'}
													onChange={(e) => handleSampleChange(e)}
												/>:selectedSample.SID
											}
										</div>
									</div>
									<div  className='row col-3'>
										<div  className='col-6 text-right'>
											病歷號:
										</div>
										<div  className='col-6'>
											{isEditable? 
												<Input
													defaultValue={selectedSample.medicalRecordNo}
													name={'medicalRecordNo'}
													onChange={(e) => handleSampleChange(e)}
												/>:selectedSample.medicalRecordNo
											}
										</div>
									</div>
									<div  className='row col-3'>
										<div  className='col-6 text-right'>
											科分號:
										</div>
										<div  className='col-6'>
											{isEditable? 
												<Input
													defaultValue={selectedSample.departmentNo}
													name={'departmentNo'}
													onChange={(e) => handleSampleChange(e)}
												/>:selectedSample.departmentNo
											}
										</div>
									</div>
									<div  className='row col-3'>
										<div  className='col-6 text-right'>
											診斷日期:
										</div>
										<div  className='col-6'>
											{isEditable? 
											<TextField
											name="checkDate"
											type="date"
											defaultValue={`${new Date(selectedSample.checkDate).getFullYear()}-${(new Date(selectedSample.checkDate).getMonth() > 8) ? (new Date(selectedSample.checkDate).getMonth() + 1) : ('0' + (new Date(selectedSample.checkDate).getMonth() + 1))}-${(new Date(selectedSample.checkDate).getDate() > 9) ? new Date(selectedSample.checkDate).getDate() : ('0' + new Date(selectedSample.checkDate).getDate())}`}
											onChange={(e) => handleSampleChange(e)}
											className={classes.textField}
											InputLabelProps={{
												shrink: true,
											}} />:new Date(selectedSample.checkDate).toLocaleDateString()
											}
										</div>
									</div>
								
								</div>
								<div className='row mx-2 my-3'>
									<div  className='row col-3'>
										<div  className='col-6 text-right'>
											Panel:
										</div>
										<div  className='col-6'>
											{selectedSample.bed}
										</div>
									</div>
								</div>
							</Paper>
							
							<SegmentTable
								data={targetSegments}
								setSelectSegments={(segments: Segment[])=>setSelectedTarget(segments)}
								title="targets"
								isEditMode={isEditable}
								isAddMode={isAdd}
							/>
							<SegmentTable
								data={otherSegments}
								setSelectSegments={(segments: Segment[])=>setSelectedOther(segments)}
								title="others"
								isEditMode={isEditable}
								isAddMode={isAdd}
							/>
							<AddSegmentTagModal show={showAddSegmentModal} title={title} onSave={title==="blacklist"?handleBlacklistAdd:handleWhitelistAdd} onClose={() => setShowAddSegmentModal(false)} segments={selectedAddSegments}></AddSegmentTagModal>
						</TabPanel>
						<TabPanel value="2">
							<CoverageTable data={selectedCoverages} title="Coverage" />
						</TabPanel>
						<TabPanel value="3">
							<MutationQCCollapsibleTable mutationQCs={selectedMutationQCs} />
						</TabPanel>
						<TabPanel value="4">
						<Paper className={classes.paper}>
								<h4 className='row mx-2'>Analysis Summary</h4>
								<div className='row mx-2 my-3'>
									<div  className='row col-4'>
										<div  className='col-6 text-right'>
											Duplication Rate:
										</div>
										<div  className='col-6'>
											{selectedSample.duplicationRate?parseFloat(selectedSample.duplicationRate+"").toFixed(2):null}%
										</div>
									</div>
									<div  className='row col-4'>
										<div  className='col-6 text-right'>
											Total Reads:
										</div>
										<div  className='col-6'>
											{selectedSample.totalReads?Math.ceil(selectedSample.totalReads):null}
										</div>
									</div>
									<div  className='row col-4'>
										<div  className='col-6 text-right'>
											Q20 bases:
										</div>
										<div  className='col-6'>
											{selectedSample.Q20Bases?parseFloat(selectedSample.Q20Bases+"").toFixed(2):null}%
										</div>
									</div>
								</div>
								<div className='row mx-2 my-3'>
									<div  className='row col-4'>
										<div  className='col-6 text-right'>
											Q30 bases:
										</div>
										<div  className='col-6'>
											{selectedSample.Q30Bases?parseFloat(selectedSample.Q30Bases+"").toFixed(2):null}%
										</div>
									</div>
									<div  className='row col-4'>
										<div  className='col-6 text-right'>
											GC Content:
										</div>
										<div  className='col-6'>
											{selectedSample.GCContent?parseFloat(selectedSample.GCContent+"").toFixed(2):null}%
										</div>
									</div>
									<div  className='row col-4'>
										<div  className='col-6 text-right'>
											Uniformity ({"≥"}Mean{"×"}0.2):
										</div>
										<div  className='col-6'>
											{selectedAligneds.length>0?(selectedCoverages.filter((d)=>d.amplion_mean_coverge>=selectedAligneds[0].meanCoverage*0.2).length/selectedCoverages.length*100).toFixed(2):null}%
										</div>
									</div>
								</div>
							</Paper>
							<AnalysisSummaryTable data={selectedAligneds}  title="Analysis Summary" />
						</TabPanel>
					</TabContext>
				</div>
			</div>
			<Paper className={classes.igvStyle} hidden={igvHidden}>
				<div id="igv-div"></div>
			</Paper>
			
			<ShowIGV>
				<Fab color="secondary" size="small" aria-label="scroll back to top" onClick={()=>setIgvHidden(!igvHidden)}>
					IGV
				</Fab>
			</ShowIGV>
			<ScrollTop {...prop}>
				<Fab color="secondary" size="small" aria-label="scroll back to top">
					<KeyboardArrowUpIcon />
				</Fab>
			</ScrollTop>
			<ExportPdfModal show={showExportPdfModal} exportData={exportPdfData} onClose={() => setShowExportPdfModal(false)} />
			<ExportModal show={showModal} exportData={exportData} exportCoverageData={exportCoverageData} onClose={() => setShowModal(false)} />
			<UploadFolderModal show={showUploadModal} onClose={() => setShowUploadModal(false)} />
			<EditDiseaseModal
				show={showEditDiseaseModal}
				sample={selectedSample}
				onClose={() => setShowEditDiseaseModal(false)}
			/>
			<EditRunDateModal
				show={showEditRunDateModal}
				run={selectedRun}
				onClose={() => setShowEditRunDateModal(false)}
			/>
			<Dialog
				open={showConfirmDialog}
				onClose={() => setShowConfirmDialog(false)}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
			>
				<DialogTitle id="alert-dialog-title">刪除資料</DialogTitle>
				<DialogContent>
					<DialogContentText id="alert-dialog-description">確認要刪除嗎？</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setShowConfirmDialog(false)} color="primary">
						取消
					</Button>
					<Button onClick={handleDeleteClick} color="primary" autoFocus>
						確認
					</Button>
				</DialogActions>
			</Dialog>
			
		
		
		<Backdrop className={classes.backdrop} open={refresh}>
			<Box position="relative" >
			<div className="text-center">
				<CircularProgress color="inherit" />
            </div>
            <div className="text-center">
                資料讀取中
            </div>
            
			</Box>
		</Backdrop>
                                
            
		</React.Fragment>
	);
};

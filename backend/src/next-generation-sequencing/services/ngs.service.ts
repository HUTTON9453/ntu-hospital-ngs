import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Run as RunEntity } from 'src/database/ngs-builder/entities/run.entity';
import { Sample as SampleEntity } from 'src/database/ngs-builder/entities/sample.entity';
import { Segment as SegmentEntity } from 'src/database/ngs-builder/entities/segment.entity';
import { SegmentTag as SegmentTagEntity } from 'src/database/ngs-builder/entities/segmentTag.entity';
import { Disease as DiseaseEntity } from 'src/database/ngs-builder/entities/disease.entity';
import { MutationQC as MutationQCEntity } from 'src/database/ngs-builder/entities/mutationQC.entity';
import { Coverage as CoverageEntity } from 'src/database/ngs-builder/entities/coverage.entity';
import { User as UserEntity } from 'src/database/ngs-builder/entities/user.entity';
import { Aligned as AlignedEntity } from 'src/database/ngs-builder/entities/aligned.entity';
import { HealthCareWorkers as HealthCareWorkersEntity } from 'src/database/ngs-builder/entities/healthCareWorkers.entity';

import { In, Repository } from 'typeorm';

import { Sample } from '../models/sample.model';
import { Segment } from '../models/segment.model';
import { SegmentTag } from '../models/segmentTag.model';
import { Disease } from '../models/disease.model';
import { FileStatus } from '../models/file.state.enum';
import * as path from 'path';
import { MutationQC } from '../models/mutationQC.model';
import { Coverage } from '../models/coverage.model';
import { Run } from '../models/run.model';
import { User } from '../models/user.model';
import { Aligned } from '../models/aligned.model';
import { HealthCareWorkers } from '../models/healthCareWorkers.model';
import { File } from '../models/file.model';
import { promisify } from 'util';

var cp = require('child_process');
const fs = require('fs');
const csv = require('csv-parser');
const { stringify } = require("csv-stringify");
const cheerio = require("cheerio");

@Injectable()
export class NGSService {
	constructor(
		@InjectRepository(RunEntity) private runRepository: Repository<RunEntity>,
		@InjectRepository(SampleEntity) private sampleRepository: Repository<SampleEntity>,
		@InjectRepository(SegmentEntity) private segmentRepository: Repository<SegmentEntity>,
		@InjectRepository(SegmentTagEntity) private segmentTagRepository: Repository<SegmentTagEntity>,
		@InjectRepository(DiseaseEntity) private diseaseRepository: Repository<DiseaseEntity>,
		@InjectRepository(MutationQCEntity) private mutationQCRepository: Repository<MutationQCEntity>,
		@InjectRepository(CoverageEntity) private coverageRepository: Repository<CoverageEntity>,
		@InjectRepository(AlignedEntity) private alignedRepository: Repository<AlignedEntity>,
		@InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
		@InjectRepository(HealthCareWorkersEntity) private healthCareWorkersRepository: Repository<HealthCareWorkersEntity>,
		private configService: ConfigService
	) {}
	
	async getAllRuns(): Promise<Run[]> {
		const runs = await this.runRepository.find({ order: { runId: 'DESC' } });
		return runs;
	}

	async getAllSegments(): Promise<Segment[]> {
		const segments = await this.segmentRepository.find({ order: { segmentId: 'DESC' } });
		return segments;
	}
	async getAllSamples(): Promise<Sample[]> {
		// 這個部分是篩選全部的sample，以下的是我更改的部分，只會篩選最新5個run的sample
		const samples = await this.sampleRepository.find({ order: { sampleId: 'DESC' } });
		console.log(samples)		
		return samples;

		// const latestruns = (await this.runRepository.find({ order: { runId: 'DESC' }, take: 5 })).map((run) => run.runId);
		// const samples = await this.sampleRepository.createQueryBuilder('sample')
		// 	.leftJoinAndSelect('sample.run', 'run')
		// 	.leftJoinAndSelect('sample.disease', 'disease')
		// 	.where("run.runId IN (:...latestruns)", { latestruns })
		// 	.orderBy('sample.sampleId', 'DESC')
		// 	.getMany();
		// console.log(samples);		
		// return samples;
	}

	async getAllBySample(id: Array<number>): Promise<{ segments: Segment[]; coverage: Coverage[]; mutationQC: MutationQC[]; aligned: Aligned[]}> {
		const segments = await this.segmentRepository.find({where:{sampleId:In(id)}});
		const coverage = await this.coverageRepository.find({where:{sampleId:In(id)}});
		const mutationQC = await this.mutationQCRepository.find({where:{sampleId:In(id)}});
		const aligned = await this.alignedRepository.find({where:{sampleId:In(id)}});
		return { segments:  segments, coverage:  coverage, mutationQC:  mutationQC, aligned:  aligned};
	}

	async deleteSamples(sampleIds: number[], runIds: number[]): Promise<Sample[]> {
		const deleteSamples = await this.sampleRepository.delete(sampleIds);
		runIds.forEach(async (id)=>{
			const count = await this.sampleRepository.count({ run:{runId: id} });
			if(count==0){
				const deleteRun = await this.runRepository.delete(id);
				console.log(deleteRun)
			}
		})
		const samples = await this.sampleRepository.find({ order: { sampleId: 'DESC' } });
		return samples;
	}

	async updateSegment(updatedSegment: Segment[]): Promise<Segment[]> {
		const segments = await this.segmentRepository.save(updatedSegment);
		return segments;
	}

	async updateRun(updatedRun: Run[]): Promise<Run[]> {
		const runs = await this.runRepository.save(updatedRun);
		return runs;
	}

	async updateSample(updatedSample: Sample[]): Promise<Sample[]> {
		const samples = await this.sampleRepository.save(updatedSample);
		return samples;
	}

	async getAllMutationQC(): Promise<MutationQC[]> {
		const mutationQCs = await this.mutationQCRepository.find();
		return mutationQCs;
	}

	async getAllCoverage(): Promise<Coverage[]> {
		const coverages = await this.coverageRepository.find();
		return coverages;
	}

	async getAllAligned(): Promise<Aligned[]> {
		const aligned = await this.alignedRepository.find();
		return aligned;
	}

	async getFilterlist(): Promise<SegmentTag[]> {
		const segmentTags = await this.segmentTagRepository.find();
		const segmentTagsModel = segmentTags.map((segmentTag) => {
			let temp = Object.assign(new SegmentTag(), segmentTag);
			temp.id = `${segmentTag.chr}_${segmentTag.position}_${segmentTag.HGVSc}_${segmentTag.HGVSp}`;
			return temp;
		});

		return segmentTagsModel;
	}

	async getMemberlist(): Promise<User[]>{
		const memberlist = await this.userRepository.find();
		return memberlist.slice(1);
	}

	async addUser(user:User){
		const confirmUser = await this.userRepository.findOne({where:{userName:user.userName}});
		if(confirmUser===undefined)
			await this.userRepository.save(user);
		else
			await this.userRepository.update({userId: confirmUser.userId},user);
		return confirmUser;
	}

	async deleteUser(users: User[]): Promise<void> {
		const response = await this.userRepository.remove(users);
		return;
	}

	async getHealthCareWorkers(): Promise<HealthCareWorkers[]>{
		const healthCareWorkerslist = await this.healthCareWorkersRepository.find();
		return healthCareWorkerslist;
	}

	async addHealthCareWorkers(healthCareWorkers: HealthCareWorkers){
		const response = await this.healthCareWorkersRepository.save(healthCareWorkers);
		
		return response;
	}

	async deleteHealthCareWorkers(healthCareWorkers: HealthCareWorkers[]): Promise<void> {
		const response = await this.healthCareWorkersRepository.remove(healthCareWorkers);
		return;
	}

	async deleteFilterlist(deleteSegmentTags: SegmentTag[]): Promise<SegmentTag[]> {
		const filterlist = await this.segmentTagRepository.remove(deleteSegmentTags);
		const segmentTagsModel = filterlist.map((segmentTag) => {
			let temp = Object.assign(new SegmentTag(), segmentTag);
			temp.id = `${segmentTag.chr}_${segmentTag.position}_${segmentTag.HGVSc}_${segmentTag.HGVSp}`;
			return temp;
		});
		return segmentTagsModel;
	}
	async addFilterlist(addSegmentTags: SegmentTag[], userName: string): Promise<SegmentTag[]> {
		addSegmentTags.forEach(data => {
			data.editor=userName
		});
		const filterlist = await this.segmentTagRepository.save(addSegmentTags);
		return filterlist;
	}
	
	async updateSegmentTag(updateSegmentTags: SegmentTag[]): Promise<SegmentTag[]> {
		const segmentTags = await this.segmentTagRepository.save(updateSegmentTags);
		return segmentTags;
	}
	mergeFiles(files: Array<string>, bed:string, fileName:string): void{
		const para1 = files.map((file)=>file+"_L001_R1_001.fastq.gz").join(' ');
		const para2 = files.map((file)=>file+"_L001_R2_001.fastq.gz").join(' ');
		var child = cp.execFileSync('bash',  [ `/home/pindel/code/merge.sh`,bed, para1,para2, fileName+"_S"+Date.now()  ]);
		/*
			(error, stdout, stderr) => {
				if (error) {
				  throw error;
				}
				console.log(stdout);
			}
		*/
	}
	async getFilelist(): Promise<{}> {
		var MPNstatus,TP53status,Myeloidstatus;
		try {
			MPNstatus = fs.readFileSync(`${this.configService.get<string>('ngs.path')}/MPN/status.txt`, 'utf-8');
		} catch (error) {
			MPNstatus = FileStatus.NotAnalyse;
		}
		try {
			TP53status = fs.readFileSync(`${this.configService.get<string>('ngs.path')}/TP53/status.txt`, 'utf-8');
		} catch (error) {
			TP53status = FileStatus.NotAnalyse;
		}
		try {
			Myeloidstatus = fs.readFileSync(`${this.configService.get<string>('ngs.path')}/Myeloid/status.txt`, 'utf-8');
		} catch (error) {
			Myeloidstatus = FileStatus.NotAnalyse;
		}

		const Myeloidbams = fs
			.readdirSync(`${this.configService.get<string>('ngs.path')}/Myeloid`)
			.filter((bam: string) => bam.match(/(\d)*_(\w)*_L001_R(1|2)_001_fastqc.html/))
			.map((file: string) => `${file.split('_')[0]}_${file.split('_')[1]}`);
		const MyeloidmutationQC = fs
			.readdirSync(`${this.configService.get<string>('ngs.path')}/Myeloid`)
			.filter((mutationQC: string) => mutationQC.match(/(\d)*_(\w)*_Target_SOMATIC_Mutation_QC.csv/))
			.map((file: string) => `${file.split('_')[0]}_${file.split('_')[1]}`)
			.filter((element, index, arr) => arr.indexOf(element) === index);
		const Myeloidfiles = fs
			.readdirSync(`${this.configService.get<string>('ngs.path')}/Myeloid`)
			.filter((file: string) => file.match(/(\d)*_(\w)*_L001_R(1|2)_001.fastq.gz/))
			.map((file: string) => `${file.split('_')[0]}_${file.split('_')[1]}`)
			.filter((element, index, arr) => arr.indexOf(element) === index);
		const diseases = await this.diseaseRepository.find();
		const unknown = diseases.find((disease) => disease.diseaseId === 1);

		const Myeloidresponse = Myeloidfiles.map((file) => {
			let disease = file.split('_')[1];
			if (disease.match(/S(\d)*/)) {
				disease = unknown;
			} else {
				disease = diseases.find((d) => d.abbr === disease);
				if (disease === undefined) {
					disease = unknown;
				}
			}
			//return {status: status, name: file, disease: disease };
			if (MyeloidmutationQC.includes(file)) {
				return { status: FileStatus.Analysed, name: file, disease: disease, SID:"", medicalRecordNo:"", departmentNo:"", checkDate: new Date(Date.now()).toLocaleDateString() };
			} else if (Myeloidbams.includes(file)) {
				return { status: FileStatus.Analysing, name: file, disease: disease, SID:"", medicalRecordNo:"", departmentNo:"", checkDate: new Date(Date.now()).toLocaleDateString()  };
			} else {
				return { status: FileStatus.NotAnalyse, name: file, disease: disease, SID:"", medicalRecordNo:"", departmentNo:"", checkDate: new Date(Date.now()).toLocaleDateString()  };
			}
		});
		const MPNbams = fs
			.readdirSync(`${this.configService.get<string>('ngs.path')}/MPN`)
			.filter((bam: string) => bam.match(/(\d)*_(\w)*_L001_R(1|2)_001_fastqc.html/))
			.map((file: string) => `${file.split('_')[0]}_${file.split('_')[1]}`);
		const MPNmutationQC = fs
			.readdirSync(`${this.configService.get<string>('ngs.path')}/MPN`)
			.filter((mutationQC: string) => mutationQC.match(/(\d)*_(\w)*_Target_SOMATIC_Mutation_QC.csv/))
			.map((file: string) => `${file.split('_')[0]}_${file.split('_')[1]}`)
			.filter((element, index, arr) => arr.indexOf(element) === index);
		const MPNfiles = fs
			.readdirSync(`${this.configService.get<string>('ngs.path')}/MPN`)
			.filter((file: string) => file.match(/(\d)*_(\w)*_L001_R(1|2)_001.fastq.gz/))
			.map((file: string) => `${file.split('_')[0]}_${file.split('_')[1]}`)
			.filter((element, index, arr) => arr.indexOf(element) === index);


		const MPNresponse = MPNfiles.map((file) => {
			let disease = file.split('_')[1];
			if (disease.match(/S(\d)*/)) {
				disease = unknown;
			} else {
				disease = diseases.find((d) => d.abbr === disease);
				if (disease === undefined) {
					disease = unknown;
				}
			}
			//return {status: status, name: file, disease: disease };
			if (MPNmutationQC.includes(file)) {
				return { status: FileStatus.Analysed, name: file, disease: disease, SID:"", medicalRecordNo:"", departmentNo:"", checkDate: new Date(Date.now()).toLocaleDateString() };
			} else if (MPNbams.includes(file)) {
				return { status: FileStatus.Analysing, name: file, disease: disease, SID:"", medicalRecordNo:"", departmentNo:"", checkDate: new Date(Date.now()).toLocaleDateString()  };
			} else {
				return { status: FileStatus.NotAnalyse, name: file, disease: disease, SID:"", medicalRecordNo:"", departmentNo:"", checkDate: new Date(Date.now()).toLocaleDateString()  };
			}
		});
		const TP53bams = fs
			.readdirSync(`${this.configService.get<string>('ngs.path')}/TP53`)
			.filter((bam: string) => bam.match(/(\d)*_(\w)*_L001_R(1|2)_001_fastqc.html/))
			.map((file: string) => `${file.split('_')[0]}_${file.split('_')[1]}`);
		const TP53mutationQC = fs
			.readdirSync(`${this.configService.get<string>('ngs.path')}/TP53`)
			.filter((mutationQC: string) => mutationQC.match(/(\d)*_(\w)*_Target_SOMATIC_Mutation_QC.csv/))
			.map((file: string) => `${file.split('_')[0]}_${file.split('_')[1]}`)
			.filter((element, index, arr) => arr.indexOf(element) === index);
		const TP53files = fs
			.readdirSync(`${this.configService.get<string>('ngs.path')}/TP53`)
			.filter((file: string) => file.match(/(\d)*_(\w)*_L001_R(1|2)_001.fastq.gz/))
			.map((file: string) => `${file.split('_')[0]}_${file.split('_')[1]}`)
			.filter((element, index, arr) => arr.indexOf(element) === index);

		const TP53response = TP53files.map((file) => {
			let disease = file.split('_')[1];
			if (disease.match(/S(\d)*/)) {
				disease = unknown;
			} else {
				disease = diseases.find((d) => d.abbr === disease);
				if (disease === undefined) {
					disease = unknown;
				}
			}
			//return {status: status, name: file, disease: disease };
			if (TP53mutationQC.includes(file)) {
				return { status: FileStatus.Analysed, name: file, disease: disease, SID:"", medicalRecordNo:"", departmentNo:"", checkDate: new Date(Date.now()).toLocaleDateString() };
			} else if (TP53bams.includes(file)) {
				return { status: FileStatus.Analysing, name: file, disease: disease, SID:"", medicalRecordNo:"", departmentNo:"", checkDate: new Date(Date.now()).toLocaleDateString()  };
			} else {
				return { status: FileStatus.NotAnalyse, name: file, disease: disease, SID:"", medicalRecordNo:"", departmentNo:"", checkDate: new Date(Date.now()).toLocaleDateString()  };
			}
		});
		return { Myeloid:{analysis: Myeloidstatus, files: Myeloidresponse },MPN:{analysis: MPNstatus, files: MPNresponse },TP53:{analysis: TP53status, files: TP53response }};
	}


	updateFile(oldSampleName, newSampleName, bed ): Promise<void> {
		const oldFileR1 = `${oldSampleName}_L001_R1_001.fastq.gz`;
		const oldFileR2 = `${oldSampleName}_L001_R2_001.fastq.gz`;
		const newFileR1 = `${newSampleName}_L001_R1_001.fastq.gz`;
		const newFileR2 = `${newSampleName}_L001_R2_001.fastq.gz`;
		const pathToFileR1 = path.join(this.configService.get<string>('ngs.path'), bed, oldFileR1);
		const pathToFileR2 = path.join(this.configService.get<string>('ngs.path'), bed, oldFileR2);
		const newPathToFileR1 = path.join(this.configService.get<string>('ngs.path'), bed, newFileR1);
		const newPathToFileR2 = path.join(this.configService.get<string>('ngs.path'), bed, newFileR2);
		try {
			fs.renameSync(pathToFileR1, newPathToFileR1);
			fs.renameSync(pathToFileR2, newPathToFileR2);
		} catch (err) {
			throw err;
		}
		return;
	}

	getBamFile(sampleName: string, runName: string) {
		var stat = fs.statSync(path.join(this.configService.get<string>('ngs.path'), runName, 'BAM', sampleName+'.bam'))
		const readBamfile = fs.createReadStream(path.join(this.configService.get<string>('ngs.path'), runName, 'BAM', sampleName+'.bam'), { encoding: "base64" });
		return [readBamfile, stat.size];
	}
	getBaiFile(sampleName: string, runName: string) {
		var stat = fs.statSync(path.join(this.configService.get<string>('ngs.path'), runName, 'BAM', sampleName+'.bam.bai'))
		const readBaifile = fs.createReadStream(path.join(this.configService.get<string>('ngs.path'), runName, 'BAM', sampleName+'.bam.bai'), { encoding: "base64" });
		return [readBaifile, stat.size];
	}

	async getDiseases(): Promise<Array<Disease>> {
		const diseases = await this.diseaseRepository.find();
		return diseases;
	}

	async addDisease(disease: Disease): Promise<void> {
		const response = await this.diseaseRepository.save(disease);
		return;
	}

	async deleteDisease(diseases: Disease[]): Promise<void> {
		const disease = await this.diseaseRepository.findOne({diseaseId:1});
		diseases.forEach(async (d)=>{
			const sampleResponse = await this.sampleRepository.update({disease: d},{disease: disease})
		})
		const response = await this.diseaseRepository.remove(diseases);
		return;
	}

	getResultList() {

		const Myeloidfiles = fs
			.readdirSync(`${this.configService.get<string>('ngs.path')}/Myeloid`)
			.filter((file: string) => file.match(/(\d)*-(\d)*-(\d)*-(\d)*/));
		const MPNfiles = fs
			.readdirSync(`${this.configService.get<string>('ngs.path')}/MPN`)
			.filter((file: string) => file.match(/(\d)*-(\d)*-(\d)*-(\d)*/));
		const TP53files = fs
			.readdirSync(`${this.configService.get<string>('ngs.path')}/TP53`)
			.filter((file: string) => file.match(/(\d)*-(\d)*-(\d)*-(\d)*/));

		return {Myeloid:Myeloidfiles, MPN:MPNfiles,TP53:TP53files };
	}

	async uploadResult(folder: string, bed: string): Promise<void> {
		const files = fs
			.readdirSync(`${this.configService.get<string>('ngs.path')}/${bed}/${folder}/FASTQ`)
			.filter((file: string) => file.match(/(\d)*_(\w)*_L001_R(1|2)_001.fastq.gz/))
			.map((file: string) => `${file.split('_')[0]}_${file.split('_')[1]}`)
			.filter((element, index, arr) => arr.indexOf(element) === index);

		const runResults = {
			runName: folder
		};
		const runsResponse = await this.runRepository.save(runResults);

		const diseases = await this.diseaseRepository.find();
		const sampleResults = files.map((file) => {
			const temp = new Sample();
			temp.sampleName = `${file.split('_')[0]}_${file.split('_')[1]}`;
			temp.SID = "";
			temp.checkDate = new Date();
			temp.departmentNo = "";
			temp.medicalRecordNo = "";
			temp.disease = diseases.find(
				(d) => (d.abbr === (file.split('_')[1].match(/S(\d)*/) ? 'unknown' : file.split('_')[1]))
			);
			temp.run.runId = runsResponse.runId;
			
			const reportHtml = fs.readFileSync(`${this.configService.get<string>(
				'ngs.path'
			)}/${bed}/${runsResponse.runName}/FASTQ_RAW/${temp.sampleName}_report.html`, 'utf8');
			const $ = cheerio.load(reportHtml);
			const general_table_tr = $('#general tr');
			const after_table_tr = $('#after_filtering_summary tr');
			temp.duplicationRate = parseFloat(general_table_tr.eq(4).find('td').eq(1).text().slice(0, -1));
			let totalReads = after_table_tr.eq(0).find('td').eq(1).text();
			if (totalReads.slice(-1)==="G")
				temp.totalReads = parseFloat(totalReads.slice(0, -2)) * 1000000000;
			else if (totalReads.slice(-1)==="M")
				temp.totalReads = parseFloat(totalReads.slice(0, -2)) * 1000000;
			else if(totalReads.slice(-1)==="K")
				temp.totalReads = parseFloat(totalReads.slice(0, -2)) * 1000;
			else
				temp.totalReads = parseFloat(totalReads);
			temp.Q20Bases = parseFloat(after_table_tr.eq(2).find('td').eq(1).text().split(" ")[2].slice(1, -2));
			temp.Q30Bases = parseFloat(after_table_tr.eq(3).find('td').eq(1).text().split(" ")[2].slice(1, -2));
			temp.GCContent = parseFloat(after_table_tr.eq(4).find('td').eq(1).text().slice(0, -1));
			temp.bed = bed;
			return temp;
		});
		const samplesResponse = await this.sampleRepository.save(sampleResults);
		let alignedArray = new Array<Aligned>();
		const alignedStream = fs
			.createReadStream(
				`${this.configService.get<string>(
					'ngs.path'
				)}/${bed}/${runsResponse.runName}/Aligned.csv`
			)
			.pipe(csv({ headers: false, skipLines: 1 }))
			.on('data', (data) => {
				let temp = new Aligned();
				temp.sample.sampleName = data['0'];
				temp.alignmentRate = data['1'];
				temp.meanCoverage = data['2'];
				temp.coverRegionPercentage = data['3'];
				temp.control1 = data['4'];
				temp.control2 = data['5'];
				temp.control3 = data['6'];
				alignedArray.push(temp);
			});
		samplesResponse.forEach((element: Sample, index: number) => {
			const segmentResults = new Array<Segment>();
			const mutationQCResults = new Array<MutationQC>();
			const coverageResults = new Array<Coverage>();
			try {
				const stream = fs
					.createReadStream(
						`${this.configService.get<string>(
							'ngs.path'
						)}/${bed}/${runsResponse.runName}/${element.sampleName}_Annotation.csv`
					)
					.pipe(csv({ headers: false, skipLines: 1 }))
					.on('data', (data) => {
						let temp = new Segment();
						temp.chr = data['0'] || '';
						temp.position = data['1'] || '';
						temp.dbSNP = data['2'] || '';
						temp.freq = parseFloat((data['5'] || '0%').split('%')[0]);
						temp.depth = parseInt(data['6']);
						temp.annotation = data['8'] || '';
						temp.geneName = data['10'] || '';
						temp.HGVSc = data['12'] || '';
						temp.HGVSp = data['13'] || '';
						if ((data['22'] +" "+ data['23'] || '').indexOf('Likely Pathogenic') !== -1) {
							temp.clinicalSignificance = 'Likely Pathogenic';
						} else if ((data['22'] +" "+ data['23'] || '').indexOf('Pathogenic') !== -1) {
							temp.clinicalSignificance = 'Pathogenic';
						} else if ((data['22'] +" "+ data['23'] || '').indexOf('Benign') !== -1) {
							temp.clinicalSignificance = 'Benign';
						} else if ((data['22'] +" "+ data['23'] || '').indexOf('uncertain significant') !== -1) {
							temp.clinicalSignificance = 'uncertain significant';
						} else if ((data['22'] +" "+ data['23'] || '').indexOf('not_provided') !== -1) {
							temp.clinicalSignificance = 'not_provided';
						} else if ((data['22'] +" "+ data['23'] || '').indexOf('VUS') !== -1) {
							temp.clinicalSignificance = 'VUS';
						} else {
							temp.clinicalSignificance = '';
						}
						if (parseFloat(data['17'])) temp.globalAF = parseFloat(data['17']);
						if (parseFloat(data['18'])) temp.AFRAF = parseFloat(data['18']);
						if (parseFloat(data['19'])) temp.AMRAF = parseFloat(data['19']);
						if (parseFloat(data['20'])) temp.EURAF = parseFloat(data['20']);
						if (parseFloat(data['21'])) temp.ASNAF = parseFloat(data['21']);
						
						if((temp.clinicalSignificance.indexOf("Pathogenic")!==-1
						||temp.clinicalSignificance.indexOf("VUS")!==-1)&& temp.freq >=3){
							temp.category="Target";
						}else if(temp.clinicalSignificance.indexOf("Benign")!==-1){
							temp.category="Other";
						}else if(temp.globalAF>=0.01||temp.AFRAF>=0.01||temp.AMRAF>=0.01||temp.EURAF>=0.01||temp.ASNAF>=0.01){
							temp.category="Other";
						}else if((temp.annotation.indexOf('stop') !==-1 ||
						temp.annotation.indexOf('missense') !==-1 ||
						temp.annotation.indexOf('frameshift') !==-1 ||
						temp.annotation.indexOf('splice') !==-1 ||
						temp.annotation.indexOf('inframe') !==-1)&& temp.freq >=3){
							temp.category="Target";
						}else{
							temp.category="Other";
						}

						//if (temp.freq >= 3) {
						temp.sample.sampleId = element.sampleId;
						segmentResults.push(temp);
						//} 

						
					})
					.on('end', async () => {
						const segmentsResponse = await this.segmentRepository.save(segmentResults);
						let alignedEntitys = alignedArray
						.filter(d => d.sample.sampleName === element.sampleName)
						.map(d => {d.sample.sampleId = element.sampleId;return d;});
						const alignedResponse = await this.alignedRepository.save(alignedEntitys);
					});
					const stream2 = fs
					.createReadStream(
						`${this.configService.get<string>(
							'ngs.path'
						)}/${bed}/${runsResponse.runName}/${element.sampleName}_Target_SOMATIC_Mutation_QC.csv`
					)
					.pipe(csv({ headers: false }))
					.on('data', (data) => {

							let temp = new MutationQC();
							temp.sample.sampleId = element.sampleId
							temp.geneName = data[0];
							temp.HGVSc = data[1];
							temp.HGVSp = data[2];
							temp.QC = data[5];
							temp.chr = data[4].split(':')[0];
							temp.cosmic = data[3];
							temp.position = data[4].split(':')[1];
							mutationQCResults.push(temp);
						
					})
					.on('end', async () => {
						const mutationQCResponse = await this.mutationQCRepository.save(mutationQCResults)
					});
					const stream3 = fs
					.createReadStream(
						`${this.configService.get<string>(
							'ngs.path'
						)}/${bed}/${runsResponse.runName}/${element.sampleName}_coverage.csv`
					)
					.pipe(csv({  headers: false, skipLines: 1  }))
					.on('data', (data) => {
						let temp = new Coverage();
						temp.sample.sampleId = element.sampleId
						temp.amplionName = data[4];
						temp.ampliconStart = data[1];
						temp.ampliconEnd = data[2];
						temp.amplion_mean_coverge = data[3];
						temp.chr = data[0];
						coverageResults.push(temp);
					})
					.on('end', async () => {
						const coverageResponse = await this.coverageRepository.save(coverageResults)
					});
					
			} catch (error) {
				console.log('error', error);
			}
			
		});

		return ;
	}
	
	async runScript(data:File[], bed: string): Promise<void> {
		fs.writeFile(`${this.configService.get<string>('ngs.path')}/${bed}/status.txt`,"1", 'utf-8',(err)=>{});
		const files = fs
			.readdirSync(`${this.configService.get<string>('ngs.path')}/${bed}`)
			.filter((file: string) => file.match(/(\d)*_(\w)*_L001_R(1|2)_001.fastq.gz/))
			.map((file: string) => `${file.split('_')[0]}_${file.split('_')[1]}`)
			.filter((element, index, arr) => arr.indexOf(element) === index);

		var child = cp.execFile('bash', [ `/home/pindel/Leukemia_analysis_with_large_indels.bash`, bed ], {
			maxBuffer: 1024 * 1024 * 1024 * 5
		});

		child.on('close', async (code) => {
			fs.writeFile(`${this.configService.get<string>('ngs.path')}/${bed}/status.txt`,FileStatus.NotAnalyse, 'utf-8',(err)=>{});
			const now = new Date(Date.now());
			const runResults = {
				runName: `${now.getFullYear()}-${('0' + (now.getMonth() + 1)).slice(-2)}-${('0' + now.getDate()).slice(
					-2
				)}-${('0' + now.getHours()).slice(-2)}`
			};
			const runsResponse = await this.runRepository.save(runResults);
			const diseases = await this.diseaseRepository.find();
			const sampleResults = files.map((file) => {
				const temp = new Sample();
				temp.sampleName = `${file.split('_')[0]}_${file.split('_')[1]}`;
				temp.SID = data.find((d)=>d.name===file)?.SID;
				temp.checkDate = data.find((d)=>d.name===file)?.checkDate;
				temp.departmentNo = data.find((d)=>d.name===file)?.departmentNo;
				temp.medicalRecordNo = data.find((d)=>d.name===file)?.medicalRecordNo;
				temp.disease = diseases.find(
					(d) => (d.abbr === (file.split('_')[1].match(/S(\d)*/) ? 'unknown' : file.split('_')[1]))
				);
				temp.run.runId = runsResponse.runId;

				const reportHtml = fs.readFileSync(`${this.configService.get<string>(
					'ngs.path'
				)}/${bed}/${runsResponse.runName}/FASTQ_RAW/${temp.sampleName}_report.html`, 'utf8');
				const $ = cheerio.load(reportHtml);
				const general_table_tr = $('#general tr');
				const after_table_tr = $('#after_filtering_summary tr');
				temp.duplicationRate = parseFloat(general_table_tr.eq(4).find('td').eq(1).text().slice(0, -1));
				let totalReads = after_table_tr.eq(0).find('td').eq(1).text();
				if (totalReads.slice(-1)==="G")
					temp.totalReads = parseFloat(totalReads.slice(0, -2)) * 1000000000;
				else if (totalReads.slice(-1)==="M")
					temp.totalReads = parseFloat(totalReads.slice(0, -2)) * 1000000;
				else if(totalReads.slice(-1)==="K")
					temp.totalReads = parseFloat(totalReads.slice(0, -2)) * 1000;
				else
					temp.totalReads = parseFloat(totalReads);
				temp.Q20Bases = parseFloat(after_table_tr.eq(2).find('td').eq(1).text().split(" ")[2].slice(1, -2));
				temp.Q30Bases = parseFloat(after_table_tr.eq(3).find('td').eq(1).text().split(" ")[2].slice(1, -2));
				temp.GCContent = parseFloat(after_table_tr.eq(4).find('td').eq(1).text().slice(0, -1));
				temp.bed = bed;
				return temp;
			});
			const samplesResponse = await this.sampleRepository.save(sampleResults);
			let alignedArray = new Array<Aligned>();
			const alignedStream = fs
			.createReadStream(
				`${this.configService.get<string>(
					'ngs.path'
				)}/${bed}/${runsResponse.runName}/Aligned.csv`
			)
			.pipe(csv({ headers: false, skipLines: 1 }))
			.on('data', (data) => {
				let temp = new Aligned();
				temp.sample.sampleName = data['0'];
				temp.alignmentRate = data['1'];
				temp.meanCoverage = data['2'];
				temp.coverRegionPercentage = data['3'];
				temp.control1 = data['4'];
				temp.control2 = data['5'];
				temp.control3 = data['6'];
				alignedArray.push(temp);
			});
			samplesResponse.forEach((element: Sample, index: number) => {
				const segmentResults = new Array<Segment>();
				const mutationQCResults = new Array<MutationQC>();
				const coverageResults = new Array<Coverage>();
				try {
					const stream = fs
						.createReadStream(
							`${this.configService.get<string>(
								'ngs.path'
							)}/${bed}/${runsResponse.runName}/${element.sampleName}_Annotation.csv`
						)
						.pipe(csv({ headers: false, skipLines: 1 }))
						.on('data', (data) => {
							let temp = new Segment();
							temp.chr = data['0'] || '';
							temp.position = data['1'] || '';
							temp.dbSNP = data['2'] || '';
							temp.freq = parseFloat((data['5'] || '0%').split('%')[0]);
							temp.depth = parseInt(data['6']);
							temp.annotation = data['8'] || '';
							temp.geneName = data['10'] || '';
							temp.HGVSc = data['12'] || '';
							temp.HGVSp = data['13'] || '';
							if ((data['22'] +" "+ data['23'] || '').indexOf('Likely Pathogenic') !== -1) {
								temp.clinicalSignificance = 'Likely Pathogenic';
							} else if ((data['22'] +" "+ data['23'] || '').indexOf('Pathogenic') !== -1) {
								temp.clinicalSignificance = 'Pathogenic';
							} else if ((data['22'] +" "+ data['23'] || '').indexOf('Benign') !== -1) {
								temp.clinicalSignificance = 'Benign';
							} else if ((data['22'] +" "+ data['23'] || '').indexOf('uncertain significant') !== -1) {
								temp.clinicalSignificance = 'uncertain significant';
							} else if ((data['22'] +" "+ data['23'] || '').indexOf('not_provided') !== -1) {
								temp.clinicalSignificance = 'not_provided';
							} else if ((data['22'] +" "+ data['23'] || '').indexOf('VUS') !== -1) {
								temp.clinicalSignificance = 'VUS';
							} else {
								temp.clinicalSignificance = '';
							}
							if (parseFloat(data['17'])) temp.globalAF = parseFloat(data['17']);
							if (parseFloat(data['18'])) temp.AFRAF = parseFloat(data['18']);
							if (parseFloat(data['19'])) temp.AMRAF = parseFloat(data['19']);
							if (parseFloat(data['20'])) temp.EURAF = parseFloat(data['20']);
							if (parseFloat(data['21'])) temp.ASNAF = parseFloat(data['21']);

							if((temp.clinicalSignificance.indexOf("Pathogenic")!==-1
							||temp.clinicalSignificance.indexOf("VUS")!==-1 )&& temp.freq >=3){
								temp.category="Target";
							}else if(temp.clinicalSignificance.indexOf("Benign")!==-1){
								temp.category="Other";
							}else if(temp.globalAF>=0.01||temp.AFRAF>=0.01||temp.AMRAF>=0.01||temp.EURAF>=0.01||temp.ASNAF>=0.01){
								temp.category="Other";
							}else if((temp.annotation.indexOf('stop') !==-1 ||
							temp.annotation.indexOf('missense') !==-1 ||
							temp.annotation.indexOf('frameshift') !==-1 ||
							temp.annotation.indexOf('splice') !==-1 ||
							temp.annotation.indexOf('inframe') !==-1)&& temp.freq >=3){
								temp.category="Target";
							}else{
								temp.category="Other";
							}

							//if (temp.freq >=3) {
							temp.sample.sampleId = element.sampleId;
							segmentResults.push(temp);
							//} 
						})
						.on('end', async () => {
							const segmentsResponse = await this.segmentRepository.save(segmentResults);
							let alignedEntitys = alignedArray
							.filter(d => d.sample.sampleName === element.sampleName)
							.map(d => {d.sample.sampleId = element.sampleId;return d;});
							const alignedResponse = await this.alignedRepository.save(alignedEntitys);
						});
						const stream2 = fs
					.createReadStream(
						`${this.configService.get<string>(
							'ngs.path'
						)}/${bed}/${runsResponse.runName}/${element.sampleName}_Target_SOMATIC_Mutation_QC.csv`
					)
					.pipe(csv({ headers: false }))
					.on('data', (data) => {
						
							let temp = new MutationQC();
							temp.sample.sampleId = element.sampleId
							temp.geneName = data[0];
							temp.HGVSc = data[1];
							temp.HGVSp = data[2];
							temp.QC = data[5];
							temp.chr = data[4].split(':')[0];
							temp.cosmic = data[3];
							temp.position = data[4].split(':')[1];
							mutationQCResults.push(temp);
						
					})
					.on('end', async () => {
						const mutationQCResponse = await this.mutationQCRepository.save(mutationQCResults)
					});
					const stream3 = fs
					.createReadStream(
						`${this.configService.get<string>(
							'ngs.path'
						)}/${bed}/${runsResponse.runName}/${element.sampleName}_coverage.csv`
					)
					.pipe(csv({  headers: false, skipLines: 1  }))
					.on('data', (data) => {
						let temp = new Coverage();
						temp.sample.sampleId = element.sampleId
						temp.amplionName = data[4];
						temp.ampliconStart = data[1];
						temp.ampliconEnd = data[2];
						temp.amplion_mean_coverge = data[3];
						temp.chr = data[0];
						coverageResults.push(temp);
					})
					.on('end', async () => {
						const coverageResponse = await this.coverageRepository.save(coverageResults)
					});
				} catch (error) {
					console.log('error', error);
				}
			});
		});
	}

	editSampleDisease(sample: Sample): Promise<void> {
		const response = this.sampleRepository.save(sample);
		return;
	}

	async downloadliscsv(header: any[], rowData: any[]): Promise<void> {
		const filename = `${this.configService.get<string>('ngs.path')}/report/${this.LISFileName()}.csv`
		const writableStream = fs.createWriteStream(filename);
		const stringifier = stringify({ header: false, columns: header });
                let firstRow = {}
                header.map(ele => { firstRow[ele.key] = ele.label })
		rowData.unshift(firstRow)
		rowData.map((row)=> {
			stringifier.write(row);
		});
		stringifier.pipe(writableStream);
		stringifier.end();
		
		console.log("Finished writing data");
		return ;
	}

	toTwoDigit(number: number): string {
        return ("0" + number).slice(-2)
    }

    LISFileName(): string {
		const now = new Date(Date.now())
        return `MPN_${now.getFullYear()}${this.toTwoDigit(now.getMonth()+1)}${this.toTwoDigit(now.getDate())}${this.toTwoDigit(now.getHours())}${this.toTwoDigit(now.getMinutes())}${this.toTwoDigit(now.getSeconds())}.csv`
    }
}

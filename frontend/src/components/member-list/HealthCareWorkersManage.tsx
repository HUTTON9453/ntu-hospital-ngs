import { Button } from "@material-ui/core";
import axios from "axios";
import React, { FunctionComponent, useEffect, useState } from "react";
import { ApiUrl } from "../../constants/constants";
import { User } from "../../models/user.model";
import { UserTable } from "../table/MemberTable";
import { Title } from "../title/Title";
import ImportExportIcon from '@material-ui/icons/ImportExport';
import { ExportDataToCsv } from '../../utils/exportDataToCsv';
import DescriptIcon from '@material-ui/icons/Description';
import { UploadCSVModal } from '../modals/UploadCsvModal';
import { HealthCareWorkers } from "../../models/healthCareWorkers.model";
import { HealthCareWorkersTable } from "../table/HealthCareWorkersTable";

const prettyLink  = {
	color: '#fff'
  };

export const HealthCareWorkersManage: FunctionComponent = (prop) => {
    const [memberlist, setMemberlist] = useState<HealthCareWorkers[]>([]);
    const [ showImportCSVModal, setShowImportCSVModal] = useState(false);
	const now = new Date(Date.now())
    useEffect(()=>{
        const getMemberlist = () => {
			try {
				axios(`${ApiUrl}/api/getHealthCareWorkers`).then((res) => {
					setMemberlist(res.data);
				});
			} catch (error){
				console.log(error);
			}
		}
        getMemberlist();

    },[]);
    const handleImportClick = (data)=>{		
		axios.post(`${ApiUrl}/api/addHealthCareWorkers`, {
			data:  data
		}).then(()=>{
			window.location.reload();
		})
	};
    return (
        <React.Fragment>
            <Button
					variant="contained"
					color="primary"
					startIcon={<ImportExportIcon />}
					className={"mx-2 my-2"}
				>
					<ExportDataToCsv fileName={`${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}-${now.getHours()}_memberlist.csv`} data={memberlist} style={prettyLink}>
                    	匯出
                	</ExportDataToCsv>
				</Button>
                <Button
					variant="contained"
					color="primary"
					startIcon={<DescriptIcon />}
					className={"mx-2 my-2"}
					onClick={()=>setShowImportCSVModal(true)}
				>
					上傳
				</Button>
            <HealthCareWorkersTable data={memberlist}></HealthCareWorkersTable>
            <UploadCSVModal handleImportClick={handleImportClick} show={showImportCSVModal} onClose={() => setShowImportCSVModal(false)} />

        </React.Fragment>
    );
}
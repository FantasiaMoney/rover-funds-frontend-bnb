import React from 'react'
import LineChart from './containers/LineChart'
import Loading from '../templates/Spiners/Loading'
import axios from 'axios'
import { Col, Row } from "react-bootstrap"
import { fromWei } from 'web3-utils';

const BloxyChartsLink = `https://charts-bsc.cotrader.com/api/smartfund/`

class MainPageCharts extends React.Component {
  constructor(props){
    super(props)
    this.state = {
    PROFITdata: {
    labels: [],
    datasets: []
    },
    DAILYVALUEdata: {
    labels: [],
    datasets: []
    },
    ROIdata: {
    labels: [],
    datasets: []
    },
    isDataLoad: false,
    reciveddata: null,
    error:false
    }
  }

  _isMounted = false

  componentDidMount = async () => {
    this._isMounted = true
    this.updateChartsData()
  }

  componentWillUnmount(){
    this._isMounted = false
  }

  componentDidUpdate = async (nextProps) => {
  if(nextProps.Data !== this.props.Data){
      this.updateChartsData()
    }
  }

  updateChartsData = async () => {
    try{
      const data = await axios.get(BloxyChartsLink + this.props.address)
      this.parseData(JSON.parse(data.data.result.balance))
    }catch(e){
      console.log("Can not load charts data ", e)
      this.setState({ error:true })
    }
  }


  parseData(data){
    const date = data.map(i => new Date(i.date * 1000).toLocaleDateString("en-US"))
    const profit = data.map(i => i.fundProfitFromWei)
    const daylyValue = data.map(i => i.fundValueFromWei)
    const roi = data.map(i => i.fundProfitFromWei / (Number(fromWei(String(i.totalWeiDeposited))) - Number(fromWei(String(i.totalWeiWithdrawn)))))

    date.unshift(0)
    profit.unshift(0)
    daylyValue.unshift(0)
    roi.unshift(0)

    const commonData = {
      fill: false,
      lineTension: 0.1,
      borderDash: [],
      borderDashOffset: 0.0,
      pointBorderWidth: 1,
      pointHoverRadius: 5,
      pointHoverBorderWidth: 2,
      pointRadius: 1,
      pointHitRadius: 10,
      borderCapStyle: 'butt',
      pointBackgroundColor: '#fff',
      borderJoinStyle: 'miter',
    }


    const parsedPROFITdata = {
      labels:date,
      datasets: [
        {
          label: 'Profit',
          backgroundColor: 'rgba(95,158,160, 0.4)',
          borderColor: 'rgba(95,158,160)',
          pointBorderColor: 'rgba(95,158,160)',
          pointHoverBackgroundColor: 'rgba(95,158,160)',
          pointHoverBorderColor: 'rgba(95,158,160)',
          ...commonData,
          data: profit.map(item => Number(item).toFixed(4))
        }
      ]
    }

    const parsedDAILYVALUEdata = {
      labels:date,
      datasets: [
        {
          label: 'Daily Value',
          backgroundColor: 'rgba(138,43,226, 0.4)',
          borderColor: 'rgba(138,43,226)',
          pointBorderColor: 'rgba(138,43,226)',
          pointBackgroundColor: '#fff',
          pointHoverBackgroundColor: 'rgba(138,43,226)',
          pointHoverBorderColor: 'rgba(138,43,226)',
          ...commonData,
          data: daylyValue.map(item => Number(item).toFixed(4))
        }
      ]
    }

    const parsedROIdata = {
      labels:date,
      datasets: [
        {
          label: 'ROI',
          backgroundColor: 'rgba(135,206,250, 0.4)',
          borderColor: 'rgba(135,206,250)',
          pointBorderColor: 'rgba(135,206,250)',
          pointHoverBackgroundColor: 'rgba(135,206,250)',
          pointHoverBorderColor: 'rgba(135,206,250)',
          ...commonData,
          data: roi.map(item => Number(item).toFixed(4))
        }
      ]
    }


    if(this._isMounted){
      this.setState({
        PROFITdata: parsedPROFITdata,
        DAILYVALUEdata: parsedDAILYVALUEdata,
        ROIdata: parsedROIdata,
        isDataLoad: true
      })
    }
  }

  render(){
  return(
    <>
     {
       !this.state.error
       ?
       (
         <div>
         {
           this.state.isDataLoad
           ?
           (
           <React.Fragment>
           {
             this.state.PROFITdata.labels.length > 0
             ?
             (
               <div className="fund-page-charts">
               <div>
               <LineChart data={this.state.ROIdata}/>
               </div>
               <div>
               <LineChart data={this.state.PROFITdata} />
               </div>
               <div>
               <LineChart data={this.state.DAILYVALUEdata} />
               </div>
               </div>
             )
             :
             (
               <Row>
               <Col>
               <strong>"No activity"</strong>
               </Col>
               <Col>
               <strong>"No activity"</strong>
               </Col>
               </Row>
             )
           }
           </React.Fragment>
           )
           :
           (
             <Row>
             <Col>
             <Loading />
             <small>Loading Deposit/Withdtaw chart</small>
             </Col>
             <Col>
             <Loading />
             <small>Loading ROI chart</small>
             </Col>
             <Col>
             <Loading />
             <small>Loading Profit charts</small>
             </Col>
             <Col>
             <Loading />
             <small>Loading Daily Value chart</small>
             </Col>
             </Row>
           )
         }
         </div>
       )
       :
       (
         <small>Can not load charts</small>
       )
     }
    </>
  )
}
}

export default MainPageCharts

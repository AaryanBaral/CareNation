import React from 'react'
import StatsCards from './StatsCards'
import SalesChart from './SalesChart'
import RecentActivity from './RecentActivity'
import PieChartBox from './PieChartBox'
import ExportButtons from './ExportButtons'
import "../../styles/Dashboard.css";

export default function 
() {
  return (
    <>
            <StatsCards />
            <SalesChart />
            <ExportButtons />
            <PieChartBox />
            <RecentActivity />
    </>
  )
}

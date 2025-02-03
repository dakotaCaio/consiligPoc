import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2'; 
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import brLocale from 'date-fns/locale/pt-BR';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { Button, Stack, TextField } from '@mui/material';
import Typography from "@material-ui/core/Typography";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import api from '../../services/api';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import './button.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  indexAxis: 'y', 
  responsive: true,
  plugins: {
    legend: { position: 'top', display: false },
    title: { display: true, text: 'Análise de Conversas Totais', position: 'left' },
    datalabels: {
      display: true,
      anchor: 'start',
      offset: -30,
      align: "start",
      color: "#fff",
      textStrokeColor: "#000",
      textStrokeWidth: 2,
      font: { size: 12, weight: "bold" },
    },
  },
  scales: {
    x: {
      beginAtZero: true,
    },
  },
};

export const ChartsDate = () => {
  const [initialDate, setInitialDate] = useState(new Date());
  const [finalDate, setFinalDate] = useState(new Date());
  const [ticketsData, setTicketsData] = useState({ data: [], count: 0 });
  const chartRef = useRef();

  const companyId = localStorage.getItem("companyId");

  // Declare handleGetTicketsInformation before useEffect
  const handleGetTicketsInformation = useCallback(async () => {
    try {
      const { data } = await api.get(
        `/dashboard/ticketsDay?initialDate=${format(initialDate, 'yyyy-MM-dd')}&finalDate=${format(finalDate, 'yyyy-MM-dd')}&companyId=${companyId}`
      );
      setTicketsData(data);
    } catch (error) {
      toast.error('Erro ao buscar informações dos tickets');
    }
  }, [companyId, initialDate, finalDate]);

  useEffect(() => {
    handleGetTicketsInformation();
  }, [handleGetTicketsInformation]);

  const dataCharts = {
    labels: ticketsData?.data.map((item) =>
      item.hasOwnProperty('horario')
        ? `Das ${item.horario}:00 às ${item.horario}:59`
        : item.data
    ),
    datasets: [
      {
        data: ticketsData?.data.map((item) => item.total),
        backgroundColor: '#A70C35',
      },
    ],
  };

  return (
    <>
      <Typography component="h2" variant="h6" gutterBottom>
        Total ({ticketsData?.count})
      </Typography>

      <Stack direction="row" spacing={2} alignItems="center" sx={{ my: 2 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={brLocale}>
          <DatePicker
            value={initialDate}
            onChange={(newValue) => setInitialDate(newValue)}
            label="Início"
            renderInput={(params) => <TextField fullWidth {...params} sx={{ width: '20ch' }} />}
          />
        </LocalizationProvider>

        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={brLocale}>
          <DatePicker
            value={finalDate}
            onChange={(newValue) => setFinalDate(newValue)}
            label="Fim"
            renderInput={(params) => <TextField fullWidth {...params} sx={{ width: '20ch' }} />}
          />
        </LocalizationProvider>

        <Button
          className="buttonHover"
          onClick={handleGetTicketsInformation}
          variant="contained"
          style={{ background: "linear-gradient(to right, #a70c35, #e73d6a)" }}
        >
          Filtrar
        </Button>
      </Stack>

      <div ref={chartRef} style={{ position: 'relative' }}>
        <Bar options={options} data={dataCharts} style={{ maxWidth: '100%', maxHeight: '280px' }} />
      </div>
    </>
  );
};

export default ChartsDate;

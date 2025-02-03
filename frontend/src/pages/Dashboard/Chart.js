import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "@material-ui/core/styles";
import { Button } from "@material-ui/core";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Label,
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
  Legend,
} from "recharts";
import { startOfHour, parseISO, format } from "date-fns";

import Title from "./Title";
import useTickets from "../../hooks/useTickets";

const Chart = ({ queueTicket }) => {
  const theme = useTheme();
  const chartRef = useRef(); // Referência para o gráfico

  const { tickets, count } = useTickets({
    queueIds: queueTicket ? `[${queueTicket}]` : "[]",
  });

  const [chartData, setChartData] = useState(
    Array.from({ length: 24 }, (_, i) => ({
      time: `${i.toString().padStart(2, "0")}:00`,
      amount: 0,
    }))
  );

  useEffect(() => {
    setChartData((prevState) => {
      const aux = [...prevState];
      aux.forEach((a) => {
        tickets.forEach((ticket) => {
          if (
            format(startOfHour(parseISO(ticket.createdAt)), "HH:mm") === a.time
          ) {
            a.amount++;
          }
        });
      });
      return aux;
    });
  }, [tickets]);

  const handleDownloadPDF = async () => {
    const chartElement = chartRef.current;
    const canvas = await html2canvas(chartElement);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    pdf.addImage(imgData, "PNG", 10, 10, 190, 100); // Ajuste a posição e tamanho conforme necessário
    pdf.save("chart.pdf");
  };

  return (
    <React.Fragment>
      <Title>{`Atendimentos Criados: ${count}`}</Title>
      <div ref={chartRef} style={{ position: "relative" }}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" stroke={theme.palette.text.secondary} />
            <YAxis
              type="number"
              allowDecimals={false}
              stroke={theme.palette.text.secondary}
            >
              <Label
                angle={270}
                position="left"
                style={{ textAnchor: "middle", fill: theme.palette.text.primary }}
              >
                Tickets
              </Label>
            </YAxis>
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#8884d8"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <Button
        variant="contained"
        color="primary"
        onClick={handleDownloadPDF}
        style={{ marginTop: "10px" }}
      >
        Exportar PDF
      </Button>
    </React.Fragment>
  );
};

export default Chart;

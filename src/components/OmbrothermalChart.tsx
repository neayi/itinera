import { BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';

export function OmbrothermalChart() {
  const data = [
    { month: 'Jan', precipitation: 65, temperature: 3 },
    { month: 'Fév', precipitation: 55, temperature: 4 },
    { month: 'Mar', precipitation: 58, temperature: 8 },
    { month: 'Avr', precipitation: 52, temperature: 11 },
    { month: 'Mai', precipitation: 68, temperature: 15 },
    { month: 'Jun', precipitation: 72, temperature: 19 },
    { month: 'Jul', precipitation: 58, temperature: 21 },
    { month: 'Aoû', precipitation: 62, temperature: 21 },
    { month: 'Sep', precipitation: 64, temperature: 17 },
    { month: 'Oct', precipitation: 68, temperature: 12 },
    { month: 'Nov', precipitation: 72, temperature: 7 },
    { month: 'Déc', precipitation: 70, temperature: 4 }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-80 flex flex-col">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <h3 className="text-sm">Diagramme ombrothermique</h3>
      </div>
      
      <div className="flex-1 p-4 min-h-0">
        <ResponsiveContainer width="100%" height="100%" minHeight={250}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 11 }}
            />
            <YAxis 
              yAxisId="left"
              tick={{ fontSize: 11 }}
              label={{ value: 'Précipitations (mm)', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11 }}
              label={{ value: 'Température (°C)', angle: 90, position: 'insideRight', style: { fontSize: 11 } }}
            />
            <Tooltip 
              contentStyle={{ fontSize: 12 }}
              formatter={(value: number, name: string) => {
                if (name === 'precipitation') return [`${value} mm`, 'Précipitations'];
                if (name === 'temperature') return [`${value} °C`, 'Température'];
                return [value, name];
              }}
            />
            <Legend 
              wrapperStyle={{ fontSize: 11 }}
              formatter={(value) => {
                if (value === 'precipitation') return 'Précipitations';
                if (value === 'temperature') return 'Température';
                return value;
              }}
            />
            <Bar yAxisId="left" dataKey="precipitation" fill="#3B82F6" />
            <Line yAxisId="right" type="monotone" dataKey="temperature" stroke="#EF4444" strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
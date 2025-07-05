import { Typography, Grid } from "@mui/material";

export default function WeatherDetails({ feels, pressure, humidity, wind, sunrise, sunset }) {
  return (
    <Grid container spacing={1} sx={{ marginTop: 2 }}>
      <Grid item xs={6}>
        <Typography variant="body2" color="text.secondary">По ощущению</Typography>
        <Typography>{feels}°C</Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="body2" color="text.secondary">Влажность</Typography>
        <Typography>{humidity}%</Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="body2" color="text.secondary">Давление</Typography>
        <Typography>{pressure} мм</Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="body2" color="text.secondary">Ветер</Typography>
        <Typography>{wind}</Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="body2" color="text.secondary">Восход</Typography>
        <Typography>{sunrise}</Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="body2" color="text.secondary">Закат</Typography>
        <Typography>{sunset}</Typography>
      </Grid>
    </Grid>
  );
}
import { Typography, Grid } from "@mui/material";
import { motion } from "framer-motion";

export default function AnimatedDetails({ details }) {
  const keys = {
    feels: "По ощущению",
    humidity: "Влажность",
    pressure: "Давление",
    wind: "Ветер",
    sunrise: "Восход",
    sunset: "Закат"
  };

  return (
    <Grid
      container
      spacing={1}
      sx={{
        marginTop: 2,
        justifyContent: "center",
        textAlign: "center"
      }}
    >
      {Object.entries(details || {}).map(([key, value], i) => (
        <Grid item xs={6} key={key}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.13, duration: 0.5 }}
          >
            <Typography variant="body2" color="text.secondary">{keys[key] || key}</Typography>
            <Typography>{value}</Typography>
          </motion.div>
        </Grid>
      ))}
    </Grid>
  );
}


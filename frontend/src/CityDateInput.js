// Обновленный CityDateInput.js с исправленными углами
import React, { useState } from "react";
import { TextField, Button, Popover } from "@mui/material";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';

function formatDate(date) {
  if (!date) return "";
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
}

export default function CityDateInput({ city, setCity, date, setDate, disabled }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDateClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, zIndex: 99 }}>
      <TextField
        value={city}
        onChange={e => setCity(e.target.value)}
        variant="outlined"
        size="medium"
        fullWidth
        sx={{
          background: "#fff",
          borderRadius: '12px !important', // Усиливаем border-radius
          height: 46,
          fontFamily: "Montserrat",
          // Убираем странные углы и тени
          '& .MuiInputBase-root': { 
            height: 52,
            borderRadius: '12px !important', // Применяем ко всему полю
            boxShadow: 'none !important', // Убираем лишние тени
            overflow: 'hidden' // Обрезаем все что выходит за границы
          },
          '& .MuiInputBase-input': {
            textAlign: "center",
            fontWeight: 500,
            fontSize: 20,
            color: "#232942",
            height: "46px !important",
            padding: "0 10px",
            fontFamily: "Montserrat",
            borderRadius: '12px !important' // Применяем к самому input
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: "white",
            borderRadius: '12px !important', // Применяем к рамке
            boxShadow: 'none !important' // Убираем тени от рамки
          },
          // Убираем углы во всех состояниях
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px !important',
            '& fieldset': {
              borderRadius: '12px !important',
              boxShadow: 'none !important'
            },
            '&:hover fieldset': {
              borderRadius: '12px !important',
              boxShadow: 'none !important'
            },
            '&.Mui-focused fieldset': {
              borderRadius: '12px !important',
              boxShadow: 'none !important'
            }
          }
        }}
        InputProps={{
          style: { 
            textAlign: "center", 
            fontFamily: "Montserrat",
            borderRadius: '12px', // Дополнительное усиление
            boxShadow: 'none' // Убираем тени
          }
        }}
        disabled={disabled}
      />
      <Button
        variant="outlined"
        onClick={handleDateClick}
        startIcon={<CalendarMonthIcon />}
        sx={{
          minWidth: 88,
          height: 46,
          fontWeight: 500,
          background: "rgba(255, 255, 255, 0.16)",
          borderColor: "primary",
          color: "primary",
          borderRadius: '12px !important', // Исправляем углы кнопки
          border: "1.5px solid rgb(0, 153, 255)",
          fontFamily: "Montserrat",
          zIndex: 99,
          boxShadow: 'none !important', // Убираем тени кнопки
          // Убираем углы во всех состояниях кнопки
          '&:hover': {
            borderRadius: '12px !important',
            boxShadow: 'none !important'
          },
          '&:focus': {
            borderRadius: '12px !important',
            boxShadow: 'none !important'
          },
          '&:active': {
            borderRadius: '12px !important',
            boxShadow: 'none !important'
          }
        }}
        disabled={disabled}
      >
        {formatDate(date)}
      </Button>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
          <DatePicker
            disablePast={false}
            value={date}
            onChange={newValue => {
              setDate(newValue);
              handleClose();
            }}
            slotProps={{
              textField: { size: 'small', sx: { m: 1 } },
            }}
          />
        </LocalizationProvider>
      </Popover>
    </div>
  );
}

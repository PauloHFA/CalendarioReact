import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';
import { API_KEY, BASE_URL, Holiday } from './config/api';

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedDayInfo, setSelectedDayInfo] = useState<{
    day: number;
    month: number;
    year: number;
    holiday?: Holiday;
  } | null>(null);

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  useEffect(() => {
    const fetchHolidays = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${BASE_URL}/holidays?api_key=${API_KEY}&country=BR&year=${selectedYear}`
        );
        const data = await response.json();
        if (data.response && data.response.holidays) {
          setHolidays(data.response.holidays);
        }
      } catch (error) {
        console.error('Error fetching holidays:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHolidays();
  }, [selectedYear]);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const isHoliday = (day: number, month: number) => {
    return holidays.some(holiday => {
      const holidayDate = new Date(holiday.date.iso);
      return holidayDate.getDate() === day && 
             holidayDate.getMonth() === month && 
             holidayDate.getFullYear() === selectedYear;
    });
  };

  const generateCalendarDays = (month: number, year: number) => {
    const daysInMonth = getDaysInMonth(month, year);
    const firstDay = getFirstDayOfMonth(month, year);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add the days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const handleDayClick = (day: number, month: number) => {
    if (day === null) return;
    
    const clickedDate = new Date(selectedYear, month, day);
    setSelectedDate(clickedDate);
    
    const holiday = holidays.find(h => {
      const holidayDate = new Date(h.date.iso);
      return holidayDate.getDate() === day && 
             holidayDate.getMonth() === month && 
             holidayDate.getFullYear() === selectedYear;
    });

    setSelectedDayInfo({
      day,
      month,
      year: selectedYear,
      holiday
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDayInfo(null);
  };

  const renderMonth = (monthIndex: number) => {
    const days = generateCalendarDays(monthIndex, selectedYear);
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
      <div key={monthIndex} className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4 text-center text-gray-800">
          {months[monthIndex]}
        </h3>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 py-1">
              {day}
            </div>
          ))}
          {days.map((day, index) => (
            <button
              key={index}
              onClick={() => handleDayClick(day, monthIndex)}
              className={`
                text-center py-1 text-sm relative cursor-pointer
                ${day === null ? 'text-gray-300 cursor-default' : 'text-gray-700'}
                ${day === selectedDate.getDate() && 
                  monthIndex === selectedDate.getMonth() ? 
                  'bg-red-500 text-white rounded-full' : ''}
                ${day && isHoliday(day, monthIndex) ? 
                  'font-bold text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors duration-200 shadow-sm' : 
                  'hover:bg-gray-100 transition-colors duration-200'}
              `}
            >
              {day}
              {day && isHoliday(day, monthIndex) && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-700 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const handlePrevYear = () => {
    setSelectedYear(prev => prev - 1);
  };

  const handleNextYear = () => {
    setSelectedYear(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <CalendarIcon className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-800">Calendário {selectedYear}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePrevYear}
              className="p-2 hover:bg-gray-200 rounded-full transition duration-200"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <button
              onClick={handleNextYear}
              className="p-2 hover:bg-gray-200 rounded-full transition duration-200"
            >
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando feriados...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {months.map((_, index) => renderMonth(index))}
          </div>
        )}

        {/* Legend */}
        <div className="mt-8 bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Legenda</h3>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-red-500 rounded-full"></div>
              <span className="text-gray-600">Data Selecionada</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 relative">
                <div className="w-6 h-6 bg-blue-100 rounded-full border-2 border-blue-300 shadow-sm"></div>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-700 rounded-full"></div>
              </div>
              <span className="text-gray-600">Feriado</span>
            </div>
          </div>
        </div>

        {/* Modal */}
        {showModal && selectedDayInfo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {selectedDayInfo.day} de {months[selectedDayInfo.month]} de {selectedDayInfo.year}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {selectedDayInfo.holiday ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-bold text-blue-700 mb-2">Feriado</h3>
                    <p className="text-gray-700">{selectedDayInfo.holiday.name}</p>
                    <p className="text-sm text-gray-600 mt-2">{selectedDayInfo.holiday.description}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">Dia comum</p>
              )}
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
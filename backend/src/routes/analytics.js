// backend/routes/analytics.js - Полная система аналитики
const express = require('express');
const router = express.Router();

module.exports = (db) => {
  
  // 📊 БАННЕР АНАЛИТИКА
  
  // Получение статистики баннеров
  router.get('/banner', async (req, res) => {
    try {
      const { limit = 100, banner_id, from_date, to_date } = req.query;
      
      let query = 'SELECT * FROM banner_analytics';
      let params = [];
      let whereConditions = [];
      
      if (banner_id) {
        whereConditions.push('banner_id = ?');
        params.push(banner_id);
      }
      
      if (from_date) {
        whereConditions.push('clicked_at >= ?');
        params.push(from_date);
      }
      
      if (to_date) {
        whereConditions.push('clicked_at <= ?');
        params.push(to_date);
      }
      
      if (whereConditions.length > 0) {
        query += ' WHERE ' + whereConditions.join(' AND ');
      }
      
      query += ' ORDER BY clicked_at DESC LIMIT ?';
      params.push(parseInt(limit));
      
      const stmt = db.prepare(query);
      const result = stmt.all(...params);
      
      // Статистика по баннерам
      const statsQuery = `
        SELECT 
          banner_id,
          COUNT(*) as total_clicks,
          COUNT(DISTINCT user_id) as unique_users,
          DATE(clicked_at) as click_date,
          COUNT(*) as daily_clicks
        FROM banner_analytics 
        WHERE clicked_at >= date('now', '-30 days')
        GROUP BY banner_id, DATE(clicked_at)
        ORDER BY clicked_at DESC
      `;
      
      const statsStmt = db.prepare(statsQuery);
      const stats = statsStmt.all();
      
      res.json({
        success: true,
        data: {
          clicks: result,
          stats: stats,
          total_records: result.length
        }
      });
      
    } catch (error) {
      console.error('❌ Ошибка получения аналитики баннеров:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
  
  // Регистрация клика по баннеру
  router.post('/banner-click', async (req, res) => {
    try {
      const { 
        banner_id = 'vtb_card', 
        user_id = 'anonymous',
        user_agent,
        referrer,
        page_url,
        click_coordinates 
      } = req.body;
      
      const ip_address = req.ip || req.connection.remoteAddress;
      
      const stmt = db.prepare(`
        INSERT INTO banner_analytics (
          banner_id, 
          user_id, 
          ip_address,
          user_agent,
          referrer,
          page_url,
          click_coordinates,
          clicked_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `);
      
      const result = stmt.run(
        banner_id, 
        user_id, 
        ip_address,
        user_agent || req.headers['user-agent'],
        referrer,
        page_url || req.headers.referer,
        JSON.stringify(click_coordinates)
      );
      
      console.log(`🎯 Клик по баннеру ${banner_id} от пользователя ${user_id}`);
      
      res.json({ 
        success: true, 
        click_id: result.lastInsertRowid 
      });
      
    } catch (error) {
      console.error('❌ Ошибка регистрации клика:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
  
  // 📱 MINIAPP АНАЛИТИКА
  
  // Начало сессии Mini App
  router.post('/miniapp/session-start', async (req, res) => {
    try {
      const { 
        telegram_id,
        platform,
        user_agent,
        screen_resolution,
        timezone 
      } = req.body;
      
      // Генерируем уникальный ID сессии
      const session_id = `ew_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const ip_address = req.ip || req.connection.remoteAddress;
      
      const stmt = db.prepare(`
        INSERT INTO miniapp_sessions (
          session_id,
          telegram_id,
          platform,
          ip_address,
          user_agent,
          screen_resolution,
          timezone,
          started_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `);
      
      stmt.run(
        session_id,
        telegram_id || 999999999, // Fallback для тестирования
        platform,
        ip_address,
        user_agent || req.headers['user-agent'],
        screen_resolution,
        timezone
      );
      
      console.log(`📱 Новая сессия Mini App: ${session_id} для пользователя: ${telegram_id}`);
      
      res.json({ 
        success: true, 
        session_id: session_id 
      });
      
    } catch (error) {
      console.error('❌ Ошибка начала сессии:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
  
  // Завершение сессии Mini App
  router.post('/miniapp/session-end', async (req, res) => {
    try {
      const { session_id, duration_seconds } = req.body;
      
      if (!session_id) {
        return res.status(400).json({
          success: false,
          error: 'session_id обязателен'
        });
      }
      
      const stmt = db.prepare(`
        UPDATE miniapp_sessions 
        SET ended_at = datetime('now'), duration_seconds = ?
        WHERE session_id = ?
      `);
      
      const result = stmt.run(duration_seconds, session_id);
      
      if (result.changes === 0) {
        return res.status(404).json({
          success: false,
          error: 'Сессия не найдена'
        });
      }
      
      console.log(`⏰ Завершение сессии Mini App: ${session_id}`);
      
      res.json({ 
        success: true,
        message: 'Сессия завершена' 
      });
      
    } catch (error) {
      console.error('❌ Ошибка завершения сессии:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
  
  // Регистрация действий в Mini App
  router.post('/miniapp/action', async (req, res) => {
    try {
      const {
        telegram_id,
        session_id,
        action_type,
        action_data,
        page_url,
        element_id
      } = req.body;
      
      const stmt = db.prepare(`
        INSERT INTO miniapp_actions (
          telegram_id,
          session_id,
          action_type,
          action_data,
          page_url,
          element_id,
          performed_at
        ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `);
      
      stmt.run(
        telegram_id,
        session_id,
        action_type,
        JSON.stringify(action_data),
        page_url,
        element_id
      );
      
      console.log(`🎬 Действие записано: ${action_type} в сессии ${session_id}`);
      
      res.json({ success: true });
      
    } catch (error) {
      console.error('❌ Ошибка записи действия:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
  
  // 📈 ОБЩАЯ АНАЛИТИКА
  
  // Получение общей статистики
  router.get('/dashboard', async (req, res) => {
    try {
      const { period = '7d' } = req.query;
      
      // Определяем период
      let dateFilter = '';
      switch (period) {
        case '1d':
          dateFilter = "datetime('now', '-1 day')";
          break;
        case '7d':
          dateFilter = "datetime('now', '-7 days')";
          break;
        case '30d':
          dateFilter = "datetime('now', '-30 days')";
          break;
        default:
          dateFilter = "datetime('now', '-7 days')";
      }
      
      // Статистика баннеров
      const bannerStats = db.prepare(`
        SELECT 
          COUNT(*) as total_clicks,
          COUNT(DISTINCT user_id) as unique_users,
          banner_id
        FROM banner_analytics 
        WHERE clicked_at >= ${dateFilter}
        GROUP BY banner_id
      `).all();
      
      // Статистика сессий
      const sessionStats = db.prepare(`
        SELECT 
          COUNT(*) as total_sessions,
          COUNT(DISTINCT telegram_id) as unique_users,
          AVG(duration_seconds) as avg_duration,
          platform
        FROM miniapp_sessions 
        WHERE started_at >= ${dateFilter}
        GROUP BY platform
      `).all();
      
      // Популярные действия
      const actionStats = db.prepare(`
        SELECT 
          action_type,
          COUNT(*) as count
        FROM miniapp_actions 
        WHERE performed_at >= ${dateFilter}
        GROUP BY action_type
        ORDER BY count DESC
        LIMIT 10
      `).all();
      
      res.json({
        success: true,
        data: {
          period,
          banners: bannerStats,
          sessions: sessionStats,
          actions: actionStats,
          generated_at: new Date().toISOString()
        }
      });
      
    } catch (error) {
      console.error('❌ Ошибка получения dashboard:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
  
  return router;
};
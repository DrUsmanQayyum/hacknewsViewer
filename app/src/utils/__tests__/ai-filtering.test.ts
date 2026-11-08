import { describe, it, expect } from 'vitest';
import videosData from '../../data/videos.json';
import type { Video } from '../../types';

const videos: Video[] = videosData as Video[];

describe('AI/ML filtering regression tests', () => {
  it('should not include general visualization content', () => {
    const falsePositives = [
      'matplotlib',
      'colormap',
      'perceptual colormap',
    ];
    
    const found = videos.filter(v => 
      falsePositives.some(fp => v.title.toLowerCase().includes(fp))
    );
    
    expect(found.length).toBe(0);
  });

  it('should not include general automotive content without AI', () => {
    const titles = videos.map(v => v.title.toLowerCase());
    
    // "Tesla Unveils" without AI/ML context
    const teslaNews = videos.filter(v => 
      v.title.toLowerCase().includes('tesla unveils') &&
      !v.title.toLowerCase().includes('ai') &&
      !v.title.toLowerCase().includes('self-driving') &&
      !v.summary.toLowerCase().includes('machine learning')
    );
    
    expect(teslaNews.length).toBe(0);
  });

  it('should not include voting systems content', () => {
    const votingVideos = videos.filter(v => 
      v.primary_topic.toLowerCase().includes('voting system')
    );
    
    expect(votingVideos.length).toBe(0);
  });

  it('should not include general future speculation', () => {
    const speculation = videos.filter(v =>
      v.title.toLowerCase().includes('the last human') ||
      v.primary_topic.toLowerCase().includes('longtermism')
    );
    
    expect(speculation.length).toBe(0);
  });

  it('should not include general statistics content', () => {
    const stats = videos.filter(v => {
      const text = (v.title + ' ' + v.summary + ' ' + v.primary_topic).toLowerCase();
      return text.includes('population statistics') && 
             !text.includes('machine learning') &&
             !text.includes('ai') &&
             !text.includes('neural');
    });
    
    expect(stats.length).toBe(0);
  });

  it('should only include robotics with AI/ML substance', () => {
    const roboticsVideos = videos.filter(v =>
      v.categories.some(c => c.id === 'robotics')
    );
    
    // Most robotics videos should mention AI/ML or automation
    let withAI = 0;
    for (const video of roboticsVideos) {
      const text = (video.title + ' ' + video.summary + ' ' + video.primary_topic).toLowerCase();
      const hasAI = text.includes('neural') || 
                    text.includes('learning') || 
                    text.includes('ai') ||
                    text.includes('autonomous') ||
                    text.includes('automation') ||
                    text.includes('vision') ||
                    text.includes('algorithm') ||
                    text.includes('ml') ||
                    text.includes('intelligence');
      
      if (hasAI) withAI++;
    }
    
    // At least 70% should have AI/ML/automation context
    const percentage = (withAI / roboticsVideos.length) * 100;
    expect(percentage).toBeGreaterThan(70);
  });

  it('should only include data visualization with explicit AI/ML', () => {
    const vizVideos = videos.filter(v =>
      v.categories.some(c => c.id === 'data-visualization')
    );
    
    // All viz videos should mention AI/ML or be in core AI category
    for (const video of vizVideos) {
      const text = (video.title + ' ' + video.summary + ' ' + video.primary_topic).toLowerCase();
      
      // Check for AI keywords
      const aiKeywords = ['neural', 'learning', 'machine learning', 'deep learning', 
                         'ai', 'model', 'training', 'computer vision', 'vision',
                         'recognition', 'intelligence', 'algorithm'];
      const hasAI = aiKeywords.some(kw => text.includes(kw));
      
      // Check for core AI category
      const hasCoreCategory = video.categories.some(c => 
        ['machine-learning', 'llms-generative-ai', 'computer-vision-speech', 'ai-safety-impact'].includes(c.id)
      );
      
      // Should not be general population/world statistics
      const isGeneralStats = text.includes('global living') || 
                            text.includes('world population') ||
                            text.includes('global development');
      
      expect(hasAI || hasCoreCategory).toBe(true);
      expect(isGeneralStats).toBe(false);
    }
  });

  it('should have explicit AI/ML keywords in most videos', () => {
    const aiKeywords = [
      'neural', 'learning', 'machine learning', 'deep learning', 'training',
      'reinforcement', 'supervised', 'unsupervised', 'ai', 'model', 'algorithm',
      'language model', 'llm', 'gpt', 'bert', 'chatgpt', 'transformer',
      'nlp', 'natural language', 'speech recognition', 'voice',
      'computer vision', 'image recognition', 'object detection', 'vision',
      'artificial intelligence', 'intelligent', 'intelligence',
      'autonomous', 'self-driving', 'robot', 'automation',
      'convolutional', 'recurrent', 'backpropagation', 'gradient',
      'gan', 'generative', 'diffusion', 'classification', 'prediction',
      'pytorch', 'tensorflow', 'keras', 'agi', 'alignment'
    ];
    
    let withKeywords = 0;
    
    for (const video of videos) {
      const text = (video.title + ' ' + video.summary + ' ' + video.primary_topic).toLowerCase();
      if (aiKeywords.some(kw => text.includes(kw))) {
        withKeywords++;
      }
    }
    
    const percentage = (withKeywords / videos.length) * 100;
    // At least 85% should have explicit keywords; rest should be in core categories
    expect(percentage).toBeGreaterThan(85);
  });

  it('dataset should be focused - less than 10% of source', () => {
    const SOURCE_TOTAL = 6454;
    const percentage = (videos.length / SOURCE_TOTAL) * 100;
    
    expect(percentage).toBeLessThan(10);
    expect(videos.length).toBeGreaterThan(200); // Not too restrictive
  });
});

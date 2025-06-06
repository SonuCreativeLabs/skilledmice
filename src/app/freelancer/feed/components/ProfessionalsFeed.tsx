"use client";

import React from 'react';
import { Star, Clock, Calendar, MapPin } from 'lucide-react';

import { Job } from '../types';

interface ProfessionalsFeedProps {
  jobs: Job[];
}

export default function ProfessionalsFeed({ jobs }: ProfessionalsFeedProps) {
  if (!jobs || jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-white/60">
        <p className="text-sm">No jobs found</p>
      </div>
    );
  }
  console.log('ProfessionalsFeed - Rendering jobs:', jobs.length);
  return (
    <div className="space-y-4 pb-24">
      {jobs.map((job) => (
        <div key={job.id} className="bg-[#1E1E1E] rounded-2xl p-5 shadow-lg border border-white/5 hover:border-white/10 transition-all duration-200 w-full hover:shadow-purple-500/10">
          {/* Job Header */}
          <div className="flex justify-between items-start gap-4 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-[15px] font-semibold text-white leading-tight mb-1.5 line-clamp-2">
                {job.title}
              </h3>
              
              {/* Location and Date */}
              <div className="flex items-center gap-3 text-[13px] text-white/60">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate max-w-[180px]">{job.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{new Date(job.postedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
            
            {/* Budget */}
            <div className="flex-shrink-0 bg-black/30 rounded-xl px-3 py-2 text-center min-w-[90px]">
              <div className="text-[15px] font-bold text-purple-400 leading-none">
                ₹{job.budget.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-white/60 font-medium mt-1">
                {job.duration}
              </div>
            </div>
          </div>

          {/* Job Description */}
          <p className="text-[13px] text-white/70 mt-3 line-clamp-2 leading-[1.5] tracking-wide">
            {job.description}
          </p>
          
          {/* Skills/Tags */}
          <div className="flex items-center gap-2 mt-4 overflow-hidden">
            <div className="flex items-center gap-2 overflow-hidden">
              {job.skills.slice(0, 2).map((skill, i) => (
                <span key={i} className="text-xs font-medium bg-black/30 text-white/90 px-3 py-1.5 rounded-full border border-white/10 hover:border-white/20 transition-colors whitespace-nowrap">
                  {skill}
                </span>
              ))}
            </div>
            {job.skills.length > 2 && (
              <span className="text-xs font-medium bg-black/20 text-white/70 px-3 py-1.5 rounded-full hover:bg-black/30 transition-colors flex-shrink-0">
                +{job.skills.length - 2} more
              </span>
            )}
          </div>

          {/* Job Footer */}
          <div className="flex justify-between items-center mt-5 pt-4 border-t border-white/[0.07]">
            <div className="flex items-center gap-3 text-xs text-white/70">
              <span className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5" />
                {job.clientRating}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {job.proposals} proposals
              </span>
            </div>
            <button className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/20">
              <span>Apply Now</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

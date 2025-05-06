using System.Collections.Generic;
using System.Threading.Tasks;
using QuaveChallenge.API.Models;
using QuaveChallenge.API.Data;
using Microsoft.EntityFrameworkCore;
using System;

namespace QuaveChallenge.API.Services
{
    public class EventService : IEventService
    {
        private readonly ApplicationDbContext _context;

        public EventService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Community>> GetCommunitiesAsync()
        {
            return await _context.Communities.ToListAsync();
        }

        public async Task<IEnumerable<Person>> GetPeopleByEventAsync(int communityId)
        {
            return await _context.People
                .Where(p => p.CommunityId == communityId)
                .Include(p => p.Community)
                .ToListAsync();
        }

        public async Task<Person> CheckInPersonAsync(int personId)
        {
            var person = await _context.People.FindAsync(personId);
            
            if (person == null)
                return null;
                
            person.CheckInDate = DateTime.UtcNow;
            person.CheckOutDate = null;
            
            await _context.SaveChangesAsync();
            return person;
        }

        public async Task<Person> CheckOutPersonAsync(int personId)
        {
            var person = await _context.People.FindAsync(personId);
            
            if (person == null)
                return null;
                
            person.CheckOutDate = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            return person;
        }

        public async Task<EventSummary> GetEventSummaryAsync(int communityId)
        {
            var community = await _context.Communities.FindAsync(communityId);
            
            if (community == null)
                return null;
                
            var people = await _context.People
                .Where(p => p.CommunityId == communityId)
                .ToListAsync();
                
            var checkedInCount = people.Count(p => p.CheckInDate != null && p.CheckOutDate == null);
            var checkedOutCount = people.Count(p => p.CheckInDate != null && p.CheckOutDate != null);
            var totalCount = people.Count;
            
            return new EventSummary
            {
                CommunityName = community.Name,
                TotalPeople = totalCount,
                CheckedInCount = checkedInCount,
                CheckedOutCount = checkedOutCount
            };
        }
    }
} 
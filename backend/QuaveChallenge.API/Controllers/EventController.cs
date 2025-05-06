using Microsoft.AspNetCore.Mvc;
using QuaveChallenge.API.Services;
using System.Threading.Tasks;

namespace QuaveChallenge.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventController : ControllerBase
    {
        private readonly IEventService _eventService;

        public EventController(IEventService eventService)
        {
            _eventService = eventService;
        }

        [HttpGet("communities")]
        public async Task<IActionResult> GetCommunities()
        {
            var communities = await _eventService.GetCommunitiesAsync();
            return Ok(communities);
        }

        [HttpGet("people/{communityId}")]
        public async Task<IActionResult> GetPeople(int communityId)
        {
            var people = await _eventService.GetPeopleByEventAsync(communityId);
            return Ok(people);
        }

        [HttpPost("check-in/{personId}")]
        public async Task<IActionResult> CheckIn(int personId)
        {
            var person = await _eventService.CheckInPersonAsync(personId);
            
            if (person == null)
                return NotFound();
                
            return Ok(person);
        }

        [HttpPost("check-out/{personId}")]
        public async Task<IActionResult> CheckOut(int personId)
        {
            var person = await _eventService.CheckOutPersonAsync(personId);
            
            if (person == null)
                return NotFound();
                
            return Ok(person);
        }

        [HttpGet("summary/{communityId}")]
        public async Task<IActionResult> GetSummary(int communityId)
        {
            var summary = await _eventService.GetEventSummaryAsync(communityId);
            
            if (summary == null)
                return NotFound();
                
            return Ok(summary);
        }
    }
} 
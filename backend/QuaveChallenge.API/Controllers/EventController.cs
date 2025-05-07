using Microsoft.AspNetCore.Mvc;
using QuaveChallenge.API.Services;
using System.Threading.Tasks;
using System.Collections.Generic;
using QuaveChallenge.API.Models;

namespace QuaveChallenge.API.Controllers
{
    /// <summary>
    /// API controller for managing community events
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class EventController : ControllerBase
    {
        private readonly IEventService _eventService;

        /// <summary>
        /// Constructor for the EventController
        /// </summary>
        /// <param name="eventService">The event service for handling business logic</param>
        public EventController(IEventService eventService)
        {
            _eventService = eventService;
        }

        /// <summary>
        /// Retrieves all available communities
        /// </summary>
        /// <remarks>
        /// This endpoint returns a list of all communities registered in the system.
        /// Each community has an Id, Name, and CreatedAt properties.
        /// </remarks>
        /// <returns>A list of communities</returns>
        /// <response code="200">Returns the list of communities</response>
        [HttpGet("communities")]
        [ProducesResponseType(typeof(IEnumerable<Community>), 200)]
        public async Task<IActionResult> GetCommunities()
        {
            var communities = await _eventService.GetCommunitiesAsync();
            return Ok(communities);
        }

        /// <summary>
        /// Retrieves all people from a specific community
        /// </summary>
        /// <remarks>
        /// This endpoint returns a list of all people registered in a specific community.
        /// Each person includes their personal details and check-in/check-out status.
        /// </remarks>
        /// <param name="communityId">The ID of the community to retrieve people from</param>
        /// <returns>A list of people belonging to the specified community</returns>
        /// <response code="200">Returns the list of people</response>
        [HttpGet("people/{communityId}")]
        [ProducesResponseType(typeof(IEnumerable<Person>), 200)]
        public async Task<IActionResult> GetPeople(int communityId)
        {
            var people = await _eventService.GetPeopleByEventAsync(communityId);
            return Ok(people);
        }

        /// <summary>
        /// Checks in a person to an event
        /// </summary>
        /// <remarks>
        /// This endpoint records a person's check-in time to the current UTC time.
        /// If the person is already checked in, their check-in time will be updated.
        /// </remarks>
        /// <param name="personId">The ID of the person to check in</param>
        /// <returns>The updated person information with check-in details</returns>
        /// <response code="200">Returns the updated person information</response>
        /// <response code="404">If the person with the specified ID was not found</response>
        [HttpPost("check-in/{personId}")]
        [ProducesResponseType(typeof(Person), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> CheckIn(int personId)
        {
            var person = await _eventService.CheckInPersonAsync(personId);
            
            if (person == null)
                return NotFound();
                
            return Ok(person);
        }

        /// <summary>
        /// Checks out a person from an event
        /// </summary>
        /// <remarks>
        /// This endpoint records a person's check-out time to the current UTC time.
        /// The person must be checked in before they can be checked out.
        /// </remarks>
        /// <param name="personId">The ID of the person to check out</param>
        /// <returns>The updated person information with check-out details</returns>
        /// <response code="200">Returns the updated person information</response>
        /// <response code="404">If the person with the specified ID was not found</response>
        [HttpPost("check-out/{personId}")]
        [ProducesResponseType(typeof(Person), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> CheckOut(int personId)
        {
            var person = await _eventService.CheckOutPersonAsync(personId);
            
            if (person == null)
                return NotFound();
                
            return Ok(person);
        }

        /// <summary>
        /// Retrieves a summary of the event for a specific community
        /// </summary>
        /// <remarks>
        /// This endpoint provides a summary of the event including:
        /// - Community name
        /// - Total number of people registered
        /// - Number of people currently checked in
        /// - Number of people who have checked out
        /// </remarks>
        /// <param name="communityId">The ID of the community to retrieve the summary for</param>
        /// <returns>A summary of the event</returns>
        /// <response code="200">Returns the event summary</response>
        /// <response code="404">If the community with the specified ID was not found</response>
        [HttpGet("summary/{communityId}")]
        [ProducesResponseType(typeof(EventSummary), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetSummary(int communityId)
        {
            var summary = await _eventService.GetEventSummaryAsync(communityId);
            
            if (summary == null)
                return NotFound();
                
            return Ok(summary);
        }
    }
} 
using Xunit;
using Moq;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using QuaveChallenge.API.Controllers;
using QuaveChallenge.API.Models;
using QuaveChallenge.API.Services;

namespace QuaveChallenge.Tests
{
    public class EventControllerTests
    {
        private readonly Mock<IEventService> _mockEventService;
        private readonly EventController _controller;

        public EventControllerTests()
        {
            _mockEventService = new Mock<IEventService>();
            _controller = new EventController(_mockEventService.Object);
        }

        [Fact]
        public async Task GetCommunities_ReturnsOkResult_WithCommunities()
        {
            // Arrange
            var communities = new List<Community>
            {
                new Community { Id = 1, Name = "Community 1", CreatedAt = DateTime.UtcNow },
                new Community { Id = 2, Name = "Community 2", CreatedAt = DateTime.UtcNow }
            };
            
            _mockEventService.Setup(service => service.GetCommunitiesAsync())
                .ReturnsAsync(communities);

            // Act
            var result = await _controller.GetCommunities();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedCommunities = Assert.IsAssignableFrom<IEnumerable<Community>>(okResult.Value);
            Assert.Equal(2, returnedCommunities.Count());
        }

        [Fact]
        public async Task GetPeople_ReturnsOkResult_WithPeople()
        {
            // Arrange
            var communityId = 1;
            var people = new List<Person>
            {
                new Person { Id = 1, FirstName = "John", LastName = "Doe", CommunityId = communityId },
                new Person { Id = 2, FirstName = "Jane", LastName = "Smith", CommunityId = communityId }
            };
            
            _mockEventService.Setup(service => service.GetPeopleByEventAsync(communityId))
                .ReturnsAsync(people);

            // Act
            var result = await _controller.GetPeople(communityId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedPeople = Assert.IsAssignableFrom<IEnumerable<Person>>(okResult.Value);
            Assert.Equal(2, returnedPeople.Count());
        }

        [Fact]
        public async Task CheckIn_ReturnsOkResult_WhenPersonExists()
        {
            // Arrange
            var personId = 1;
            var person = new Person
            {
                Id = personId,
                FirstName = "John",
                LastName = "Doe",
                CommunityId = 1,
                CheckInDate = DateTime.UtcNow
            };
            
            _mockEventService.Setup(service => service.CheckInPersonAsync(personId))
                .ReturnsAsync(person);

            // Act
            var result = await _controller.CheckIn(personId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedPerson = Assert.IsType<Person>(okResult.Value);
            Assert.Equal(personId, returnedPerson.Id);
            Assert.NotNull(returnedPerson.CheckInDate);
        }

        [Fact]
        public async Task CheckIn_ReturnsNotFound_WhenPersonDoesNotExist()
        {
            // Arrange
            var personId = 999;
            
            _mockEventService.Setup(service => service.CheckInPersonAsync(personId))
                .ReturnsAsync((Person)null);

            // Act
            var result = await _controller.CheckIn(personId);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task CheckOut_ReturnsOkResult_WhenPersonExists()
        {
            // Arrange
            var personId = 1;
            var person = new Person
            {
                Id = personId,
                FirstName = "John",
                LastName = "Doe",
                CommunityId = 1,
                CheckInDate = DateTime.UtcNow.AddHours(-1),
                CheckOutDate = DateTime.UtcNow
            };
            
            _mockEventService.Setup(service => service.CheckOutPersonAsync(personId))
                .ReturnsAsync(person);

            // Act
            var result = await _controller.CheckOut(personId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedPerson = Assert.IsType<Person>(okResult.Value);
            Assert.Equal(personId, returnedPerson.Id);
            Assert.NotNull(returnedPerson.CheckOutDate);
        }

        [Fact]
        public async Task CheckOut_ReturnsNotFound_WhenPersonDoesNotExist()
        {
            // Arrange
            var personId = 999;
            
            _mockEventService.Setup(service => service.CheckOutPersonAsync(personId))
                .ReturnsAsync((Person)null);

            // Act
            var result = await _controller.CheckOut(personId);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task GetSummary_ReturnsOkResult_WithSummary()
        {
            // Arrange
            var communityId = 1;
            var summary = new EventSummary
            {
                CommunityName = "Community 1",
                TotalPeople = 10,
                CheckedInCount = 5,
                CheckedOutCount = 3
            };
            
            _mockEventService.Setup(service => service.GetEventSummaryAsync(communityId))
                .ReturnsAsync(summary);

            // Act
            var result = await _controller.GetSummary(communityId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedSummary = Assert.IsType<EventSummary>(okResult.Value);
            Assert.Equal("Community 1", returnedSummary.CommunityName);
            Assert.Equal(10, returnedSummary.TotalPeople);
            Assert.Equal(5, returnedSummary.CheckedInCount);
            Assert.Equal(3, returnedSummary.CheckedOutCount);
        }

        [Fact]
        public async Task GetSummary_ReturnsNotFound_WhenCommunityDoesNotExist()
        {
            // Arrange
            var communityId = 999;
            
            _mockEventService.Setup(service => service.GetEventSummaryAsync(communityId))
                .ReturnsAsync((EventSummary)null);

            // Act
            var result = await _controller.GetSummary(communityId);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }
    }
}

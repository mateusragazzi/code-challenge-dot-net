using Xunit;
using Moq;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Threading;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using QuaveChallenge.API.Data;
using QuaveChallenge.API.Hubs;
using QuaveChallenge.API.Models;
using QuaveChallenge.API.Services;

namespace QuaveChallenge.Tests
{
    public class EventServiceTests
    {
        private readonly Mock<IHubContext<EventHub>> _mockHubContext;
        private readonly Mock<IClientProxy> _mockClientProxy;
        private readonly ApplicationDbContext _context;
        private readonly EventService _eventService;

        public EventServiceTests()
        {
            // Setup in-memory database
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
                .Options;
            
            _context = new ApplicationDbContext(options);
            
            // Setup test data
            var communities = new List<Community>
            {
                new Community { Id = 1, Name = "Community 1", CreatedAt = DateTime.UtcNow },
                new Community { Id = 2, Name = "Community 2", CreatedAt = DateTime.UtcNow }
            };

            var people = new List<Person>
            {
                new Person { 
                    Id = 1, 
                    FirstName = "John", 
                    LastName = "Doe", 
                    CompanyName = "Test Company", 
                    Title = "Developer", 
                    CommunityId = 1
                },
                new Person { 
                    Id = 2, 
                    FirstName = "Jane", 
                    LastName = "Smith", 
                    CompanyName = "Another Company", 
                    Title = "Manager", 
                    CommunityId = 1
                },
                new Person { 
                    Id = 3, 
                    FirstName = "Bob", 
                    LastName = "Johnson", 
                    CompanyName = "Third Company", 
                    Title = "Designer", 
                    CommunityId = 2
                }
            };

            // Add data to context
            _context.Communities.AddRange(communities);
            _context.People.AddRange(people);
            _context.SaveChanges();

            // Setup SignalR Hub
            _mockClientProxy = new Mock<IClientProxy>();
            var mockClients = new Mock<IHubClients>();
            mockClients.Setup(clients => clients.All).Returns(_mockClientProxy.Object);
            
            _mockHubContext = new Mock<IHubContext<EventHub>>();
            _mockHubContext.Setup(x => x.Clients).Returns(mockClients.Object);

            // Create service instance
            _eventService = new EventService(_context, _mockHubContext.Object);
        }

        [Fact]
        public async Task GetCommunitiesAsync_ShouldReturnAllCommunities()
        {
            // Act
            var result = await _eventService.GetCommunitiesAsync();

            // Assert
            var communities = result.ToList();
            Assert.Equal(2, communities.Count);
            Assert.Equal("Community 1", communities[0].Name);
            Assert.Equal("Community 2", communities[1].Name);
        }

        [Fact]
        public async Task GetPeopleByEventAsync_ShouldReturnPeopleForSpecificCommunity()
        {
            // Arrange
            var communityId = 1;

            // Act
            var result = await _eventService.GetPeopleByEventAsync(communityId);

            // Assert
            var people = result.ToList();
            Assert.Equal(2, people.Count);
            Assert.All(people, p => Assert.Equal(communityId, p.CommunityId));
        }

        [Fact]
        public async Task CheckInPersonAsync_ShouldUpdateCheckInDateAndReturnPerson()
        {
            // Arrange
            var personId = 1;

            // Act
            var result = await _eventService.CheckInPersonAsync(personId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(personId, result.Id);
            Assert.NotNull(result.CheckInDate);
            Assert.Null(result.CheckOutDate);
            
            // Verify SendAsync was called with correct parameters
            _mockClientProxy.Verify(
                x => x.SendCoreAsync(
                    "ReceiveEventUpdate",
                    It.Is<object[]>(args => 
                        args.Length == 3 && 
                        (string)args[0] == "check-in" && 
                        (int)args[1] == result.CommunityId && 
                        (int)args[2] == result.Id),
                    It.IsAny<CancellationToken>()),
                Times.Once);
                
            // Verify the data was persisted
            var updatedPerson = await _context.People.FindAsync(personId);
            Assert.NotNull(updatedPerson.CheckInDate);
            Assert.Null(updatedPerson.CheckOutDate);
        }

        [Fact]
        public async Task CheckInPersonAsync_WithInvalidId_ShouldReturnNull()
        {
            // Arrange
            var invalidPersonId = 999;

            // Act
            var result = await _eventService.CheckInPersonAsync(invalidPersonId);

            // Assert
            Assert.Null(result);
            
            // Verify SendAsync was never called
            _mockClientProxy.Verify(
                x => x.SendCoreAsync(
                    It.IsAny<string>(),
                    It.IsAny<object[]>(),
                    It.IsAny<CancellationToken>()),
                Times.Never);
        }

        [Fact]
        public async Task CheckOutPersonAsync_ShouldUpdateCheckOutDateAndReturnPerson()
        {
            // Arrange
            var personId = 1;
            var person = await _context.People.FindAsync(personId);
            person.CheckInDate = DateTime.UtcNow.AddHours(-1);
            await _context.SaveChangesAsync();

            // Act
            var result = await _eventService.CheckOutPersonAsync(personId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(personId, result.Id);
            Assert.NotNull(result.CheckOutDate);
            
            // Verify SendAsync was called with correct parameters
            _mockClientProxy.Verify(
                x => x.SendCoreAsync(
                    "ReceiveEventUpdate",
                    It.Is<object[]>(args => 
                        args.Length == 3 && 
                        (string)args[0] == "check-out" && 
                        (int)args[1] == result.CommunityId && 
                        (int)args[2] == result.Id),
                    It.IsAny<CancellationToken>()),
                Times.Once);
                
            // Verify the data was persisted
            var updatedPerson = await _context.People.FindAsync(personId);
            Assert.NotNull(updatedPerson.CheckOutDate);
        }

        [Fact]
        public async Task CheckOutPersonAsync_WithInvalidId_ShouldReturnNull()
        {
            // Arrange
            var invalidPersonId = 999;

            // Act
            var result = await _eventService.CheckOutPersonAsync(invalidPersonId);

            // Assert
            Assert.Null(result);
            
            // Verify SendAsync was never called
            _mockClientProxy.Verify(
                x => x.SendCoreAsync(
                    It.IsAny<string>(),
                    It.IsAny<object[]>(),
                    It.IsAny<CancellationToken>()),
                Times.Never);
        }

        [Fact]
        public async Task GetEventSummaryAsync_ShouldReturnCorrectSummary()
        {
            // Arrange
            var communityId = 1;
            
            // Setup check-in/out status
            var person1 = await _context.People.FindAsync(1);
            person1.CheckInDate = DateTime.UtcNow.AddHours(-2);
            person1.CheckOutDate = null; // Checked in
            
            var person2 = await _context.People.FindAsync(2);
            person2.CheckInDate = DateTime.UtcNow.AddHours(-3);
            person2.CheckOutDate = DateTime.UtcNow.AddHours(-1); // Checked out
            
            await _context.SaveChangesAsync();

            // Act
            var result = await _eventService.GetEventSummaryAsync(communityId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Community 1", result.CommunityName);
            Assert.Equal(2, result.TotalPeople);
            Assert.Equal(1, result.CheckedInCount);
            Assert.Equal(1, result.CheckedOutCount);
        }

        [Fact]
        public async Task GetEventSummaryAsync_WithInvalidId_ShouldReturnNull()
        {
            // Arrange
            var invalidCommunityId = 999;

            // Act
            var result = await _eventService.GetEventSummaryAsync(invalidCommunityId);

            // Assert
            Assert.Null(result);
        }
    }
} 
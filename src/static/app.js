document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const paginationControls = document.getElementById("pagination-controls");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  let activities = [];
  let currentPage = 1;
  const pageSize = 5;

  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activitiesData = await response.json();
      activities = Object.entries(activitiesData);

      renderActivities();
      renderActivityOptions();
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      paginationControls.innerHTML = "";
      console.error("Error fetching activities:", error);
    }
  }

  function renderActivityOptions() {
    activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';
    activities.forEach(([name]) => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      activitySelect.appendChild(option);
    });
  }

  function renderActivities() {
    activitiesList.innerHTML = "";
    const totalPages = Math.max(1, Math.ceil(activities.length / pageSize));
    currentPage = Math.min(currentPage, totalPages);

    const startIndex = (currentPage - 1) * pageSize;
    const currentActivities = activities.slice(startIndex, startIndex + pageSize);

    if (currentActivities.length === 0) {
      activitiesList.innerHTML = "<p>No activities available.</p>";
    }

    currentActivities.forEach(([name, details]) => {
      const activityCard = document.createElement("div");
      activityCard.className = "activity-card";

      const spotsLeft = details.max_participants - details.participants.length;
      const participantsHtml = details.participants.length > 0
        ? `<ul class="participants-list">${details.participants.map((email) => `
              <li>
                <span class="participant-email">${email}</span>
                <button class="participant-remove" data-activity="${encodeURIComponent(name)}" data-email="${encodeURIComponent(email)}" title="Remove participant" aria-label="Remove participant">🗑️</button>
              </li>
            `).join("")}</ul>`
        : `<p class="no-participants">No participants yet</p>`;

      activityCard.innerHTML = `
        <h4>${name}</h4>
        <p>${details.description}</p>
        <p><strong>Schedule:</strong> ${details.schedule}</p>
        <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        <div class="participants-section">
          <p><strong>Participants:</strong></p>
          ${participantsHtml}
        </div>
      `;

      activitiesList.appendChild(activityCard);
    });

    renderPagination(totalPages);
  }

  function renderPagination(totalPages) {
    if (totalPages <= 1) {
      paginationControls.innerHTML = "";
      return;
    }

    const previousDisabled = currentPage === 1 ? "disabled" : "";
    const nextDisabled = currentPage === totalPages ? "disabled" : "";

    paginationControls.innerHTML = `
      <button class="pagination-button" data-action="prev" ${previousDisabled}>Previous</button>
      <span class="pagination-info">Page ${currentPage} of ${totalPages}</span>
      <button class="pagination-button" data-action="next" ${nextDisabled}>Next</button>
    `;
  }

  paginationControls.addEventListener("click", (event) => {
    const button = event.target.closest(".pagination-button");
    if (!button) return;

    const action = button.dataset.action;
    const totalPages = Math.max(1, Math.ceil(activities.length / pageSize));

    if (action === "prev" && currentPage > 1) {
      currentPage -= 1;
    }

    if (action === "next" && currentPage < totalPages) {
      currentPage += 1;
    }

    renderActivities();
  });

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  activitiesList.addEventListener("click", async (event) => {
    const removeButton = event.target.closest(".participant-remove");
    if (!removeButton) return;

    const activity = decodeURIComponent(removeButton.dataset.activity);
    const email = decodeURIComponent(removeButton.dataset.email);

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/participants?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to remove participant. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error removing participant:", error);
    }
  });

  // Initialize app
  fetchActivities();
});

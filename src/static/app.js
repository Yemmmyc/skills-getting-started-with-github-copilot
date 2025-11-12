document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // main activity info
        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        // Participants section (built with DOM methods)
        const participantsSection = document.createElement("div");
        participantsSection.className = "participants-section";

        const heading = document.createElement("h5");
        heading.textContent = "Participants";
        participantsSection.appendChild(heading);

        if (Array.isArray(details.participants) && details.participants.length > 0) {
          const ul = document.createElement("ul");
          ul.className = "participants-list";

          details.participants.forEach((participant) => {
            const li = document.createElement("li");
            li.className = "participant-pill";
            // Container for participant email and delete icon
            const span = document.createElement("span");
            span.textContent = participant;
            li.appendChild(span);

            // Delete icon
            const deleteIcon = document.createElement("span");
            deleteIcon.className = "delete-icon";
            deleteIcon.title = "Remove participant";
            deleteIcon.innerHTML = "&#128465;"; // Unicode trash can
            deleteIcon.style.cursor = "pointer";
            deleteIcon.style.marginLeft = "8px";
            deleteIcon.onclick = async (e) => {
              e.stopPropagation();
              if (confirm(`Remove ${participant} from ${name}?`)) {
                try {
                  const response = await fetch(`/activities/${encodeURIComponent(name)}/unregister`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: participant })
                  });
                  const result = await response.json();
                  if (response.ok) {
                    fetchActivities();
                  } else {
                    alert(result.detail || "Failed to remove participant.");
                  }
                } catch (err) {
                  alert("Error removing participant.");
                }
              }
            };
            li.appendChild(deleteIcon);
            ul.appendChild(li);
          });

          participantsSection.appendChild(ul);
        } else {
          const noP = document.createElement("p");
          noP.className = "no-participants";
          noP.textContent = "No participants yet";
          participantsSection.appendChild(noP);
        }

        activityCard.appendChild(participantsSection);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

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
  // Refresh activities list to show new participant
  fetchActivities();
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

  // Initialize app
  fetchActivities();
});

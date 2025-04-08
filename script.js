$(document).ready(function () {
  const $wheelInner = $(".wheel-inner");
  const $spinButton = $(".spin-button");
  const $spinsCountElement = $(".spins-count span");
  const $register = $(".register");
  const $closeRegister = $(".close-register");

  const prizes = [
    { name: "200%", description: "On your Deposit" },
    { name: "ONE", description: "More Try" },
    { name: "200%", description: "On your Deposit" },
    { name: "3", description: "Free Spins" },
    { name: "Without", description: "Win" },
    { name: "3", description: "Free Spins" },
    { name: "ONE", description: "More Try" },
    { name: "200%", description: "On your Deposit" },
    { name: "3", description: "Free Spins" },
    { name: "Without", description: "Win" },
  ];

  const segmentAngle = 360 / prizes.length; // 22.5 degrees
  let spinsLeft = parseInt($spinsCountElement.text());
  let isSpinning = false;
  let totalRotation = 0;
  let userPrizes = [];

  // Load prizes from cookies on page load
  const loadPrizesFromCookies = () => {
    const savedPrizes = getCookie("userPrizes");
    if (savedPrizes) {
      try {
        userPrizes = JSON.parse(savedPrizes);
        console.log("Loaded prizes from cookies:", userPrizes);
      } catch (e) {
        console.error("Error parsing prizes from cookies:", e);
        userPrizes = [];
      }
    }
  };

  // Save prizes to cookies
  const savePrizesToCookies = () => {
    setCookie("userPrizes", JSON.stringify(userPrizes), 30); // Store for 30 days
    console.log("Saved prizes to cookies:", userPrizes);
  };

  // Cookie helper functions
  const setCookie = (name, value, days) => {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  };

  const getCookie = (name) => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  loadPrizesFromCookies();

  const getRandomRotation = () => {
    const fullSpins = 360 * (6 + Math.floor(Math.random() * 7)); // 6 to 12 full spins
    const extraSegment = Math.floor(Math.random() * prizes.length); // 0-15
    return fullSpins + extraSegment * segmentAngle;
  };

  const showPrizeNotification = (prize) => {
    const $prize = $(".prize");
    const $prizeCard = $prize.find(".prize-card");
    const $prizeButton = $prizeCard.find("button");
    const $register = $(".register");
    const $registerContent = $register.find(".register-content h3");

    $prizeCard.find("h3").text(prize.name);
    $prizeCard.find("h4").text(prize.description);

    // Update button text based on spins left
    if (spinsLeft > 0) {
      $prizeButton.text("SPIN AGAIN");
    } else {
      $prizeButton.text("SPIN AGAIN");
    }

    $prize.fadeIn(300);

    $prizeButton.off("click").on("click", () => {
      $prize.fadeOut(300);

      // If the user has no spins left, show the register form
      if (spinsLeft <= 0) {
        // Format the prizes for display in the register form
        let prizeText = "";

        // Group prizes by type
        const prizeGroups = {};
        userPrizes.forEach((p) => {
          const key = `${p.name} ${p.description}`;
          if (!prizeGroups[key]) {
            prizeGroups[key] = 0;
          }
          prizeGroups[key]++;
        });

        // Create the display text
        const prizeEntries = Object.entries(prizeGroups);
        if (prizeEntries.length > 0) {
          prizeText = prizeEntries
            .map(([prize, count]) => {
              return `${count}x ${prize}`;
            })
            .join(" <span>&</span> ");
        } else {
          prizeText = "No prizes yet";
        }

        // Update the register form heading
        $registerContent.html(prizeText);

        // Show the register form
        $register.fadeIn(300);
      } else if (!isSpinning) {
        // If the user has spins left, trigger the spin wheel
        spinWheel();
      }
    });
  };

  const spinWheel = () => {
    if (spinsLeft > 0 && !isSpinning) {
      isSpinning = true;
      spinsLeft--;
      $spinsCountElement.text(spinsLeft);

      const rotation = getRandomRotation();
      totalRotation += rotation;

      $wheelInner.css({
        transition: "transform 5s ease-out",
        transform: `rotate(${totalRotation}deg)`,
      });

      $spinButton.prop("disabled", true).css("opacity", "0.7");

      setTimeout(() => {
        isSpinning = false;
        $spinButton.prop("disabled", false).css("opacity", "1");

        if (spinsLeft === 0) {
          $spinButton.prop("disabled", true).css("opacity", "0.5");
        }

        // Correct prize calculation
        const normalizedRotation = totalRotation % 360;
        const pointerOffset = segmentAngle / 0.5; // Adjust so pointer hits center of segment
        const adjustedAngle = (360 - normalizedRotation + pointerOffset) % 360;
        const prizeIndex = Math.floor(adjustedAngle / segmentAngle);
        const wonPrize = prizes[prizeIndex];

        // Check if user has already won 3 Free Spins
        const hasWonFreeSpins = userPrizes.some(
          (prize) => prize.name === "3" && prize.description === "Free Spins"
        );

        // If the prize is 3 Free Spins and user has already won it, change to a different prize
        let finalPrize = wonPrize;
        if (
          wonPrize.name === "3" &&
          wonPrize.description === "Free Spins" &&
          hasWonFreeSpins
        ) {
          // Change to "ONE More Try" instead
          finalPrize = { name: "ONE", description: "More Try" };
          console.log(
            "User already won 3 Free Spins, changing to ONE More Try"
          );
        }

        // Add spins based on the prize won
        if (
          finalPrize.name === "3" &&
          finalPrize.description === "Free Spins"
        ) {
          spinsLeft += 3;
          $spinsCountElement.text(spinsLeft);
          $spinButton.prop("disabled", false).css("opacity", "1");

          // Show a visual indicator for added spins
          const $spinsCount = $(".spins-count");
          $spinsCount.addClass("spins-added");
          setTimeout(() => {
            $spinsCount.removeClass("spins-added");
          }, 2000);
        } else if (
          finalPrize.name === "ONE" &&
          finalPrize.description === "More Try"
        ) {
          spinsLeft += 1;
          $spinsCountElement.text(spinsLeft);
          $spinButton.prop("disabled", false).css("opacity", "1");

          // Show a visual indicator for added spins
          const $spinsCount = $(".spins-count");
          $spinsCount.addClass("spins-added");
          setTimeout(() => {
            $spinsCount.removeClass("spins-added");
          }, 2000);
        }

        // Store the won prize in the user's prizes array
        userPrizes.push({
          name: finalPrize.name,
          description: finalPrize.description,
          date: new Date().toISOString(),
        });

        // Save to cookies
        savePrizesToCookies();

        console.log(
          `Rotation: ${normalizedRotation.toFixed(
            2
          )}°, Prize Index: ${prizeIndex}`
        );
        showPrizeNotification(finalPrize);
      }, 5000);
    }
  };

  $spinButton.on("click", spinWheel);

  // Close register form when close button is clicked
  $closeRegister.on("click", function () {
    $register.fadeOut(300);
  });

  // Close register form when clicking outside the card
  $register.on("click", function (e) {
    if ($(e.target).is($register)) {
      $register.fadeOut(300);
    }
  });
});

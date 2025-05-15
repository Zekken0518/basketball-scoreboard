document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const homeScore = document.getElementById("home-score")
    const awayScore = document.getElementById("away-score")
    const homeFouls = document.getElementById("home-fouls")
    const awayFouls = document.getElementById("away-fouls")
    const quarter = document.getElementById("quarter")
    const timer = document.getElementById("timer")
    const shotClock = document.getElementById("shot-clock")
    const startStopBtn = document.getElementById("start-stop")
    const resetTimerBtn = document.getElementById("reset-timer")
    const nextQuarterBtn = document.getElementById("next-quarter")
    const overtimeBtn = document.getElementById("overtime")
    const resetGameBtn = document.getElementById("reset-game")
    const setTimerBtn = document.getElementById("set-timer")
    const timerMinutes = document.getElementById("timer-minutes")
    const timerSeconds = document.getElementById("timer-seconds")
    const resetShotClock24Btn = document.getElementById("reset-shot-clock-24")
    const resetShotClock14Btn = document.getElementById("reset-shot-clock-14")
    const shotClockPlusBtn = document.getElementById("shot-clock-plus")
    const shotClockMinusBtn = document.getElementById("shot-clock-minus")
    const toggleShotClockBtn = document.getElementById("toggle-shot-clock")
    const homeTeamName = document.getElementById("home-team-name")
    const awayTeamName = document.getElementById("away-team-name")
    const homeControlName = document.getElementById("home-control-name")
    const awayControlName = document.getElementById("away-control-name")
    const homeLogoInput = document.getElementById("home-logo-input")
    const awayLogoInput = document.getElementById("away-logo-input")
    const homeLogoBtn = document.getElementById("home-logo-btn")
    const awayLogoBtn = document.getElementById("away-logo-btn")
    const homeLogo = document.getElementById("home-logo")
    const awayLogo = document.getElementById("away-logo")
    const themeToggle = document.getElementById("theme-toggle")
    const themeToggleIcon = document.querySelector(".theme-toggle-icon")
    const fullscreenBtn = document.getElementById("fullscreen-btn")
    const fullscreenIcon = document.querySelector(".fullscreen-icon")
    const htmlElement = document.documentElement
    const container = document.querySelector(".container")
  
    // Game state
    let scores = {
      home: 0,
      away: 0,
    }
  
    let fouls = {
      home: 0,
      away: 0,
    }
  
    let currentQuarter = 1
    let isOvertime = false
    let timerRunning = false
    let timerInterval
    let timerValue = 600 // 10 minutes in seconds
    let shotClockValue = 24
    let shotClockRunning = false
    let shotClockInterval
    let isDarkMode = true // Default to dark mode
    let isFullscreen = false
  
    // Initialize the timer display
    updateTimerDisplay()
    updateShotClockDisplay()
  
    // Theme toggle
    themeToggle.addEventListener("click", () => {
      isDarkMode = !isDarkMode
      updateTheme()
      saveSettings()
    })
  
    // Fullscreen toggle
    fullscreenBtn.addEventListener("click", toggleFullscreen)
  
    function toggleFullscreen() {
      if (!isFullscreen) {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen()
        } else if (document.documentElement.webkitRequestFullscreen) {
          document.documentElement.webkitRequestFullscreen()
        } else if (document.documentElement.msRequestFullscreen) {
          document.documentElement.msRequestFullscreen()
        }
        isFullscreen = true
        fullscreenIcon.textContent = "⛶"
        container.classList.add("fullscreen-mode")
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen()
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen()
        }
        isFullscreen = false
        fullscreenIcon.textContent = "⛶"
        container.classList.remove("fullscreen-mode")
      }
    }
  
    // Listen for fullscreen change events
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange)
    document.addEventListener("mozfullscreenchange", handleFullscreenChange)
    document.addEventListener("MSFullscreenChange", handleFullscreenChange)
  
    function handleFullscreenChange() {
      isFullscreen =
        !!document.fullscreenElement ||
        !!document.webkitFullscreenElement ||
        !!document.mozFullScreenElement ||
        !!document.msFullscreenElement
  
      if (isFullscreen) {
        fullscreenIcon.textContent = "⛶"
        container.classList.add("fullscreen-mode")
      } else {
        fullscreenIcon.textContent = "⛶"
        container.classList.remove("fullscreen-mode")
      }
    }
  
    function updateTheme() {
      if (isDarkMode) {
        htmlElement.classList.remove("light-mode")
        htmlElement.classList.add("dark-mode")
        themeToggleIcon.textContent = "🌙" // Moon icon for dark mode
      } else {
        htmlElement.classList.remove("dark-mode")
        htmlElement.classList.add("light-mode")
        themeToggleIcon.textContent = "☀️" // Sun icon for light mode
      }
    }
  
    // Score buttons
    document.querySelectorAll(".btn[data-points]").forEach((button) => {
      button.addEventListener("click", function () {
        const team = this.getAttribute("data-team")
        const points = Number.parseInt(this.getAttribute("data-points"))
  
        scores[team] += points
        if (scores[team] < 0) scores[team] = 0
  
        updateScoreDisplay()
      })
    })
  
    // Foul buttons
    document.querySelectorAll(".foul-btn, .foul-btn-subtract").forEach((button) => {
      button.addEventListener("click", function () {
        const team = this.getAttribute("data-team")
        const action = this.getAttribute("data-action")
  
        if (action === "add") {
          fouls[team]++
        } else if (action === "subtract") {
          if (fouls[team] > 0) {
            fouls[team]--
          }
        }
  
        updateFoulsDisplay()
      })
    })
  
    // Logo upload buttons
    homeLogoBtn.addEventListener("click", () => {
      homeLogoInput.click()
    })
  
    awayLogoBtn.addEventListener("click", () => {
      awayLogoInput.click()
    })
  
    // Timer controls
    startStopBtn.addEventListener("click", () => {
      if (timerRunning) {
        stopTimer()
        startStopBtn.textContent = "Start"
      } else {
        startTimer()
        startStopBtn.textContent = "Stop"
      }
    })
  
    resetTimerBtn.addEventListener("click", () => {
      resetTimer()
    })
  
    setTimerBtn.addEventListener("click", () => {
      const minutes = Number.parseInt(timerMinutes.value) || 0
      const seconds = Number.parseInt(timerSeconds.value) || 0
      timerValue = minutes * 60 + seconds
      updateTimerDisplay()
    })
  
    // Quarter control
    nextQuarterBtn.addEventListener("click", () => {
      if (isOvertime) {
        // If in overtime, increment OT periods
        currentQuarter++
        quarter.textContent = `OT${currentQuarter - 4}`
      } else if (currentQuarter < 4) {
        // Regular quarters 1-4
        currentQuarter++
        quarter.textContent = currentQuarter
      } else {
        // Move to overtime after 4th quarter
        isOvertime = true
        currentQuarter = 5
        quarter.textContent = "OT1"
      }
      resetTimer()
      resetShotClockTo24()
    })
  
    // Overtime button
    overtimeBtn.addEventListener("click", () => {
      isOvertime = true
      if (currentQuarter < 5) {
        currentQuarter = 5
        quarter.textContent = "OT1"
      } else {
        currentQuarter++
        quarter.textContent = `OT${currentQuarter - 4}`
      }
      // Set timer to 5 minutes for overtime
      timerMinutes.value = 5
      timerSeconds.value = 0
      resetTimer()
      resetShotClockTo24()
    })
  
    // Reset game
    resetGameBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to reset the game?")) {
        scores.home = 0
        scores.away = 0
        fouls.home = 0
        fouls.away = 0
        currentQuarter = 1
        isOvertime = false
        resetTimer()
        resetShotClockTo24()
        updateScoreDisplay()
        updateFoulsDisplay()
        quarter.textContent = currentQuarter
        // Reset timer to 10 minutes for regular quarters
        timerMinutes.value = 10
        timerSeconds.value = 0
      }
    })
  
    // Shot clock controls
    resetShotClock24Btn.addEventListener("click", () => {
      resetShotClockTo24()
    })
  
    resetShotClock14Btn.addEventListener("click", () => {
      resetShotClockTo14()
    })
  
    shotClockPlusBtn.addEventListener("click", () => {
      shotClockValue++
      updateShotClockDisplay()
    })
  
    shotClockMinusBtn.addEventListener("click", () => {
      if (shotClockValue > 0) {
        shotClockValue--
        updateShotClockDisplay()
      }
    })
  
    toggleShotClockBtn.addEventListener("click", () => {
      if (shotClockRunning) {
        stopShotClock()
        toggleShotClockBtn.textContent = "Start Shot Clock"
      } else {
        if (timerRunning) {
          startShotClock()
          toggleShotClockBtn.textContent = "Stop Shot Clock"
        } else {
          alert("Game clock must be running to start shot clock")
        }
      }
    })
  
    // Team name updates
    homeTeamName.addEventListener("input", function () {
      homeControlName.textContent = this.value || "HOME"
      // Update document title to show team names
      updateDocumentTitle()
    })
  
    awayTeamName.addEventListener("input", function () {
      awayControlName.textContent = this.value || "AWAY"
      // Update document title to show team names
      updateDocumentTitle()
    })
  
    // Logo uploads
    homeLogoInput.addEventListener("change", function () {
      handleLogoUpload(this, homeLogo)
    })
  
    awayLogoInput.addEventListener("change", function () {
      handleLogoUpload(this, awayLogo)
    })
  
    // Functions
    function updateScoreDisplay() {
      homeScore.textContent = scores.home
      awayScore.textContent = scores.away
    }
  
    function updateFoulsDisplay() {
      homeFouls.textContent = fouls.home
      awayFouls.textContent = fouls.away
    }
  
    function startTimer() {
      if (timerValue <= 0) return
  
      timerRunning = true
      timerInterval = setInterval(() => {
        timerValue--
        updateTimerDisplay()
  
        if (timerValue <= 0) {
          stopTimer()
          stopShotClock()
          playBuzzer()
          alert("Time is up!")
        }
      }, 1000)
  
      // Automatically start the shot clock when game clock starts
      if (!shotClockRunning && shotClockValue > 0) {
        startShotClock()
      }
    }
  
    function stopTimer() {
      timerRunning = false
      clearInterval(timerInterval)
      // Also stop shot clock when game clock stops
      stopShotClock()
    }
  
    function resetTimer() {
      stopTimer()
      timerValue = Number.parseInt(timerMinutes.value) * 60 + Number.parseInt(timerSeconds.value)
      updateTimerDisplay()
      startStopBtn.textContent = "Start"
    }
  
    function updateTimerDisplay() {
      const minutes = Math.floor(timerValue / 60)
      const seconds = timerValue % 60
      timer.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }
  
    function startShotClock() {
      if (shotClockValue <= 0) return
  
      shotClockRunning = true
      shotClockInterval = setInterval(() => {
        shotClockValue--
        updateShotClockDisplay()
  
        if (shotClockValue <= 0) {
          stopShotClock()
          playBuzzer()
          alert("Shot clock violation!")
        }
      }, 1000)
  
      // Update button text
      toggleShotClockBtn.textContent = "Stop Shot Clock"
    }
  
    function stopShotClock() {
      shotClockRunning = false
      clearInterval(shotClockInterval)
      toggleShotClockBtn.textContent = "Start Shot Clock"
    }
  
    function resetShotClockTo24() {
      stopShotClock()
      shotClockValue = 24
      updateShotClockDisplay()
    }
  
    function resetShotClockTo14() {
      stopShotClock()
      shotClockValue = 14
      updateShotClockDisplay()
    }
  
    function updateShotClockDisplay() {
      shotClock.textContent = shotClockValue
    }
  
    function playBuzzer() {
      // Create a simple buzzer sound
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
  
        oscillator.type = "square"
        oscillator.frequency.value = 440
        gainNode.gain.value = 0.5
  
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
  
        oscillator.start()
  
        // Stop after 1 second
        setTimeout(() => {
          oscillator.stop()
        }, 1000)
      } catch (e) {
        console.log("Audio not supported")
      }
    }
  
    function handleLogoUpload(input, imgElement) {
      if (input.files && input.files[0]) {
        const file = input.files[0]
  
        // Check file size (limit to 2MB)
        if (file.size > 2 * 1024 * 1024) {
          alert("File is too large. Maximum size is 2MB.")
          return
        }
  
        // Check file type
        if (!file.type.match("image.*")) {
          alert("Only image files are allowed.")
          return
        }
  
        const reader = new FileReader()
  
        reader.onload = (e) => {
          imgElement.src = e.target.result
        }
  
        reader.readAsDataURL(file)
      }
    }
  
    // Add a function to update the document title with team names
    function updateDocumentTitle() {
      const home = homeTeamName.value || "HOME"
      const away = awayTeamName.value || "AWAY"
      document.title = `${home} vs ${away} - Basketball Scoreboard`
    }
  
    // Save game state and settings to localStorage
    function saveGameState() {
      const gameState = {
        scores,
        fouls,
        currentQuarter,
        isOvertime,
        timerValue,
        shotClockValue,
        homeTeam: homeTeamName.value,
        awayTeam: awayTeamName.value,
        // Add logo data if available
        homeLogoSrc: homeLogo.src.startsWith("data:") ? homeLogo.src : null,
        awayLogoSrc: awayLogo.src.startsWith("data:") ? awayLogo.src : null,
      }
  
      localStorage.setItem("basketballGameState", JSON.stringify(gameState))
    }
  
    // Save settings separately from game state
    function saveSettings() {
      const settings = {
        isDarkMode,
      }
      localStorage.setItem("basketballSettings", JSON.stringify(settings))
    }
  
    // Load settings
    function loadSettings() {
      const savedSettings = localStorage.getItem("basketballSettings")
  
      if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        isDarkMode = settings.isDarkMode
        updateTheme()
      }
    }
  
    // Update the loadGameState function to load team names
    function loadGameState() {
      const savedState = localStorage.getItem("basketballGameState")
  
      if (savedState) {
        const gameState = JSON.parse(savedState)
  
        scores = gameState.scores
        fouls = gameState.fouls
        currentQuarter = gameState.currentQuarter
        isOvertime = gameState.isOvertime || false
        timerValue = gameState.timerValue
        shotClockValue = gameState.shotClockValue || 24
  
        homeTeamName.value = gameState.homeTeam || "HOME"
        awayTeamName.value = gameState.awayTeam || "AWAY"
        homeControlName.textContent = gameState.homeTeam || "HOME"
        awayControlName.textContent = gameState.awayTeam || "AWAY"
  
        // Restore logo images if available
        if (gameState.homeLogoSrc) {
          homeLogo.src = gameState.homeLogoSrc
        }
        if (gameState.awayLogoSrc) {
          awayLogo.src = gameState.awayLogoSrc
        }
  
        updateScoreDisplay()
        updateFoulsDisplay()
        updateTimerDisplay()
        updateShotClockDisplay()
  
        // Update quarter display with correct format
        if (isOvertime) {
          quarter.textContent = `OT${currentQuarter - 4}`
        } else {
          quarter.textContent = currentQuarter
        }
  
        updateDocumentTitle()
      }
    }
  
    // Handle orientation changes
    window.addEventListener("orientationchange", () => {
      // Give the browser time to adjust
      setTimeout(() => {
        // Adjust layout based on new orientation
        adjustLayoutForOrientation()
      }, 200)
    })
  
    function adjustLayoutForOrientation() {
      // This function can be expanded if needed for specific orientation adjustments
      // Currently, CSS media queries handle most of the orientation-specific styling
    }
  
    // Prevent zooming on double-tap for touch devices
    document.addEventListener(
      "touchstart",
      (event) => {
        if (event.touches.length > 1) {
          event.preventDefault()
        }
      },
      { passive: false },
    )
  
    // Prevent pull-to-refresh on mobile
    document.body.addEventListener(
      "touchmove",
      (e) => {
        if (e.touches.length > 1) {
          e.preventDefault()
        }
      },
      { passive: false },
    )
  
    // Auto-save game state every 30 seconds
    setInterval(saveGameState, 30000)
  
    // Save game state when page is unloaded
    window.addEventListener("beforeunload", saveGameState)
  
    // Load settings and game state when page loads
    loadSettings()
    loadGameState()
  
    // Call updateDocumentTitle on page load
    updateDocumentTitle()
  
    // Initial orientation adjustment
    adjustLayoutForOrientation()
  })
  
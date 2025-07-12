export const getJoyrideSteps = (translate: (key: string) => string) => [
    {
        target: ".home-screen",
        content: "Home screen.",
        disableBeacon: true,
    },
    {
        target: "#menu-create-transactions",
        content: "Lets create transactions.",
        disableBeacon: true,
        disableOverlayClose: true,
        hideCloseButton: true,
        hideFooter: true,
        spotlightClicks: true,
    },
    {
        target: ".content-overlay-body",
        content: "Create transaction.",
        disableBeacon: true,
    }
]
export class unity_html_playable {

    onInit() {
        // Wait for the SDK to become ready: 
        //@ts-ignore
        if (mraid.getState() === 'loading') {
            // If the SDK is still loading, add a listener for the 'ready' event:
            //@ts-ignore
            mraid.addEventListener('ready', onSdkReady);
        } else {
            // Otherwise, if the SDK is ready, execute your function:
            this.onSdkReady();
        }
    }

    // Implement a function that shows the ad when it first renders:
    onSdkReady() {
        // The viewableChange event fires if the ad container's viewability status changes.
        // Add a listener for the viewabilityChange event, to handle pausing and resuming: 
        //@ts-ignore
        mraid.addEventListener('viewableChange', viewableChangeHandler);
        // The isViewable method returns whether the ad container is viewable on the screen.
        //@ts-ignore
        if (mraid.isViewable()) {
            // If the ad container is visible, play the ad:
            this.showMyAd();
        }
    }

    // Implement a function for executing the ad:
    showMyAd() {
        // Insert code for showing your playable ad. 
    }

    // Implement a function that handles pausing and resuming the ad based on visibility:
    viewableChangeHandler(viewable) {
        if (viewable) {
            // If the ad is viewable, show the ad:
            this.showMyAd();
        } else {
            // If not, pause the ad.
        }
    }

    openAndroid(link: string) {
        //@ts-ignore
        mraid.open(link);
    }

    openIOS(link: string) {
        //@ts-ignore
        mraid.open(link);
    }
}
export default new unity_html_playable();
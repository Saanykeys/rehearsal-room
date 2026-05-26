namespace RehearsalRoomAPI.Models.Auth
{
    public class RegisterRequest
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;

        /// <summary>
        /// Optional — when provided and valid, registers as Music Director
        /// and creates a new Organization.
        /// </summary>
        public string DirectorCode { get; set; } = string.Empty;

        /// <summary>
        /// Required when registering as a Music Director.
        /// The name of the church or organization.
        /// </summary>
        public string OrgName { get; set; } = string.Empty;

        /// <summary>
        /// Required when registering as a Team Member.
        /// The invite code shared by the Music Director.
        /// </summary>
        public string InviteCode { get; set; } = string.Empty;
    }
}

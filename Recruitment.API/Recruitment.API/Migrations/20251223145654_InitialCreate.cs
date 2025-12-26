using System;
using Microsoft.EntityFrameworkCore.Migrations;
using MySql.EntityFrameworkCore.Metadata;

#nullable disable

namespace Recruitment.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    role_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    role_name = table.Column<string>(type: "longtext", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.role_id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Skills",
                columns: table => new
                {
                    skill_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    skill_name = table.Column<string>(type: "longtext", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Skills", x => x.skill_id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    first_name = table.Column<string>(type: "longtext", nullable: false),
                    last_name = table.Column<string>(type: "longtext", nullable: false),
                    email = table.Column<string>(type: "longtext", nullable: false),
                    password_hash = table.Column<string>(type: "longtext", nullable: false),
                    role_id = table.Column<int>(type: "int", nullable: false),
                    otp_code = table.Column<string>(type: "longtext", nullable: true),
                    otp_expiry = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.user_id);
                    table.ForeignKey(
                        name: "FK_Users_Roles_role_id",
                        column: x => x.role_id,
                        principalTable: "Roles",
                        principalColumn: "role_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Application_Comments",
                columns: table => new
                {
                    comment_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    application_id = table.Column<int>(type: "int", nullable: false),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    comment = table.Column<string>(type: "longtext", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Application_Comments", x => x.comment_id);
                    table.ForeignKey(
                        name: "FK_Application_Comments_Users_user_id",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Candidates",
                columns: table => new
                {
                    candidate_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    first_name = table.Column<string>(type: "longtext", nullable: false),
                    last_name = table.Column<string>(type: "longtext", nullable: false),
                    email = table.Column<string>(type: "longtext", nullable: false),
                    phone = table.Column<string>(type: "longtext", nullable: true),
                    cv_path = table.Column<string>(type: "longtext", nullable: true),
                    created_by_user_id = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    user_id = table.Column<int>(type: "int", nullable: true),
                    college_name = table.Column<string>(type: "longtext", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Candidates", x => x.candidate_id);
                    table.ForeignKey(
                        name: "FK_Candidates_Users_created_by_user_id",
                        column: x => x.created_by_user_id,
                        principalTable: "Users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Jobs",
                columns: table => new
                {
                    job_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    title = table.Column<string>(type: "longtext", nullable: false),
                    description = table.Column<string>(type: "longtext", nullable: false),
                    status = table.Column<string>(type: "longtext", nullable: false),
                    status_reason = table.Column<string>(type: "longtext", nullable: true),
                    created_by_user_id = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Jobs", x => x.job_id);
                    table.ForeignKey(
                        name: "FK_Jobs_Users_created_by_user_id",
                        column: x => x.created_by_user_id,
                        principalTable: "Users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Applications",
                columns: table => new
                {
                    application_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    candidate_id = table.Column<int>(type: "int", nullable: false),
                    job_id = table.Column<int>(type: "int", nullable: false),
                    status = table.Column<string>(type: "longtext", nullable: false),
                    applied_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    joining_date = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Applications", x => x.application_id);
                    table.ForeignKey(
                        name: "FK_Applications_Candidates_candidate_id",
                        column: x => x.candidate_id,
                        principalTable: "Candidates",
                        principalColumn: "candidate_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Applications_Jobs_job_id",
                        column: x => x.job_id,
                        principalTable: "Jobs",
                        principalColumn: "job_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Job_Interviewers",
                columns: table => new
                {
                    job_interviewer_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    job_id = table.Column<int>(type: "int", nullable: false),
                    interviewer_user_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Job_Interviewers", x => x.job_interviewer_id);
                    table.ForeignKey(
                        name: "FK_Job_Interviewers_Jobs_job_id",
                        column: x => x.job_id,
                        principalTable: "Jobs",
                        principalColumn: "job_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Job_Interviewers_Users_interviewer_user_id",
                        column: x => x.interviewer_user_id,
                        principalTable: "Users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Job_Reviewers",
                columns: table => new
                {
                    job_reviewer_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    job_id = table.Column<int>(type: "int", nullable: false),
                    reviewer_user_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Job_Reviewers", x => x.job_reviewer_id);
                    table.ForeignKey(
                        name: "FK_Job_Reviewers_Jobs_job_id",
                        column: x => x.job_id,
                        principalTable: "Jobs",
                        principalColumn: "job_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Job_Reviewers_Users_reviewer_user_id",
                        column: x => x.reviewer_user_id,
                        principalTable: "Users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Job_Skills",
                columns: table => new
                {
                    job_skill_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    job_id = table.Column<int>(type: "int", nullable: false),
                    skill_id = table.Column<int>(type: "int", nullable: false),
                    is_required = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Job_Skills", x => x.job_skill_id);
                    table.ForeignKey(
                        name: "FK_Job_Skills_Jobs_job_id",
                        column: x => x.job_id,
                        principalTable: "Jobs",
                        principalColumn: "job_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Job_Skills_Skills_skill_id",
                        column: x => x.skill_id,
                        principalTable: "Skills",
                        principalColumn: "skill_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Candidate_Documents",
                columns: table => new
                {
                    document_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    application_id = table.Column<int>(type: "int", nullable: false),
                    document_type = table.Column<string>(type: "longtext", nullable: false),
                    file_path = table.Column<string>(type: "longtext", nullable: false),
                    verification_status = table.Column<string>(type: "longtext", nullable: false),
                    uploaded_by_user_id = table.Column<int>(type: "int", nullable: false),
                    uploaded_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Candidate_Documents", x => x.document_id);
                    table.ForeignKey(
                        name: "FK_Candidate_Documents_Applications_application_id",
                        column: x => x.application_id,
                        principalTable: "Applications",
                        principalColumn: "application_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Candidate_Documents_Users_uploaded_by_user_id",
                        column: x => x.uploaded_by_user_id,
                        principalTable: "Users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Interviews",
                columns: table => new
                {
                    interview_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    application_id = table.Column<int>(type: "int", nullable: false),
                    round_number = table.Column<int>(type: "int", nullable: false),
                    interview_type = table.Column<string>(type: "longtext", nullable: false),
                    scheduled_at = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    status = table.Column<string>(type: "longtext", nullable: false),
                    meeting_link = table.Column<string>(type: "longtext", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Interviews", x => x.interview_id);
                    table.ForeignKey(
                        name: "FK_Interviews_Applications_application_id",
                        column: x => x.application_id,
                        principalTable: "Applications",
                        principalColumn: "application_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Interview_Feedback",
                columns: table => new
                {
                    feedback_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    interview_id = table.Column<int>(type: "int", nullable: false),
                    interviewer_user_id = table.Column<int>(type: "int", nullable: false),
                    rating = table.Column<int>(type: "int", nullable: true),
                    comments = table.Column<string>(type: "longtext", nullable: false),
                    recommendation = table.Column<string>(type: "longtext", nullable: false),
                    submitted_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Interview_Feedback", x => x.feedback_id);
                    table.ForeignKey(
                        name: "FK_Interview_Feedback_Interviews_interview_id",
                        column: x => x.interview_id,
                        principalTable: "Interviews",
                        principalColumn: "interview_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Interview_Feedback_Users_interviewer_user_id",
                        column: x => x.interviewer_user_id,
                        principalTable: "Users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Interview_Panel",
                columns: table => new
                {
                    interview_panel_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    interview_id = table.Column<int>(type: "int", nullable: false),
                    interviewer_user_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Interview_Panel", x => x.interview_panel_id);
                    table.ForeignKey(
                        name: "FK_Interview_Panel_Interviews_interview_id",
                        column: x => x.interview_id,
                        principalTable: "Interviews",
                        principalColumn: "interview_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Interview_Panel_Users_interviewer_user_id",
                        column: x => x.interviewer_user_id,
                        principalTable: "Users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Application_Comments_user_id",
                table: "Application_Comments",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_Applications_candidate_id",
                table: "Applications",
                column: "candidate_id");

            migrationBuilder.CreateIndex(
                name: "IX_Applications_job_id",
                table: "Applications",
                column: "job_id");

            migrationBuilder.CreateIndex(
                name: "IX_Candidate_Documents_application_id",
                table: "Candidate_Documents",
                column: "application_id");

            migrationBuilder.CreateIndex(
                name: "IX_Candidate_Documents_uploaded_by_user_id",
                table: "Candidate_Documents",
                column: "uploaded_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_Candidates_created_by_user_id",
                table: "Candidates",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_Interview_Feedback_interview_id",
                table: "Interview_Feedback",
                column: "interview_id");

            migrationBuilder.CreateIndex(
                name: "IX_Interview_Feedback_interviewer_user_id",
                table: "Interview_Feedback",
                column: "interviewer_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_Interview_Panel_interview_id",
                table: "Interview_Panel",
                column: "interview_id");

            migrationBuilder.CreateIndex(
                name: "IX_Interview_Panel_interviewer_user_id",
                table: "Interview_Panel",
                column: "interviewer_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_Interviews_application_id",
                table: "Interviews",
                column: "application_id");

            migrationBuilder.CreateIndex(
                name: "IX_Job_Interviewers_interviewer_user_id",
                table: "Job_Interviewers",
                column: "interviewer_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_Job_Interviewers_job_id",
                table: "Job_Interviewers",
                column: "job_id");

            migrationBuilder.CreateIndex(
                name: "IX_Job_Reviewers_job_id",
                table: "Job_Reviewers",
                column: "job_id");

            migrationBuilder.CreateIndex(
                name: "IX_Job_Reviewers_reviewer_user_id",
                table: "Job_Reviewers",
                column: "reviewer_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_Job_Skills_job_id",
                table: "Job_Skills",
                column: "job_id");

            migrationBuilder.CreateIndex(
                name: "IX_Job_Skills_skill_id",
                table: "Job_Skills",
                column: "skill_id");

            migrationBuilder.CreateIndex(
                name: "IX_Jobs_created_by_user_id",
                table: "Jobs",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_Users_role_id",
                table: "Users",
                column: "role_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Application_Comments");

            migrationBuilder.DropTable(
                name: "Candidate_Documents");

            migrationBuilder.DropTable(
                name: "Interview_Feedback");

            migrationBuilder.DropTable(
                name: "Interview_Panel");

            migrationBuilder.DropTable(
                name: "Job_Interviewers");

            migrationBuilder.DropTable(
                name: "Job_Reviewers");

            migrationBuilder.DropTable(
                name: "Job_Skills");

            migrationBuilder.DropTable(
                name: "Interviews");

            migrationBuilder.DropTable(
                name: "Skills");

            migrationBuilder.DropTable(
                name: "Applications");

            migrationBuilder.DropTable(
                name: "Candidates");

            migrationBuilder.DropTable(
                name: "Jobs");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Roles");
        }
    }
}

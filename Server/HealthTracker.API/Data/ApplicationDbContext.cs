using Microsoft.EntityFrameworkCore;
using HealthTracker.API.Models;

namespace HealthTracker.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Medication> Medications { get; set; }
    public DbSet<MedicationDose> MedicationDoses { get; set; }
    public DbSet<Vital> Vitals { get; set; }
    public DbSet<Prescription> Prescriptions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId);
            entity.Property(e => e.Username).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.PasswordHash).IsRequired();
        });

        // Medication configuration
        modelBuilder.Entity<Medication>(entity =>
        {
            entity.HasKey(e => e.MedicationId);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Dosage).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Frequency).IsRequired().HasMaxLength(100);

            entity.HasOne(e => e.User)
                .WithMany(u => u.Medications)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // MedicationDose configuration
        modelBuilder.Entity<MedicationDose>(entity =>
        {
            entity.HasKey(e => e.DoseId);

            entity.HasOne(e => e.Medication)
                .WithMany(m => m.MedicationDoses)
                .HasForeignKey(e => e.MedicationId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Vital configuration
        modelBuilder.Entity<Vital>(entity =>
        {
            entity.HasKey(e => e.VitalId);
            entity.Property(e => e.Weight).HasColumnType("decimal(5,2)");

            entity.HasOne(e => e.User)
                .WithMany(u => u.Vitals)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Prescription configuration
        modelBuilder.Entity<Prescription>(entity =>
        {
            entity.HasKey(e => e.PrescriptionId);
            entity.Property(e => e.FileName).IsRequired().HasMaxLength(255);
            entity.Property(e => e.FilePath).IsRequired().HasMaxLength(500);

            entity.HasOne(e => e.User)
                .WithMany(u => u.Prescriptions)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}

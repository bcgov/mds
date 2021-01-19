﻿using System.Collections.Generic;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace EJ2FileManagerService
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1);

            services.AddCors(options =>
            {
                options.AddPolicy("AllowAllOrigins", builder =>
                {
                    builder.AllowAnyOrigin()
                    .AllowAnyMethod()
                    .AllowAnyHeader();
                });
            });

            // services.AddTransient<IClaimsTransformation, ClaimsTransformer>();

            // services.AddAuthentication(options =>
            // {
            //     options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            //     options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            // }).AddJwtBearer(o =>
            // {
            //     o.Authority = System.Environment.GetEnvironmentVariable("JWT_OIDC_AUTHORITY"); ;
            //     o.Audience = System.Environment.GetEnvironmentVariable("JWT_OIDC_AUDIENCE"); ;
            // });

            // services.AddAuthorization(options =>
            // {
            //     options.AddPolicy("View", policy => { policy.RequireClaim(ClaimTypes.Role, new string[] { "core_view_all" }); });
            // });

            services.AddSwaggerGen();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            DotNetEnv.Env.Load();
            DotNetEnv.Env.TraversePath().Load();

            // Register Syncfusion License (https://help.syncfusion.com/common/essential-studio/licensing/license-key)
            string syncfusionLicenseKey = System.Environment.GetEnvironmentVariable("SYNCFUSION_LICENSE_KEY");
            Syncfusion.Licensing.SyncfusionLicenseProvider.RegisterLicense(syncfusionLicenseKey);

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseHsts();
            }

            // app.UseAuthentication();
            app.UseCors("AllowAllOrigins");
            app.UseMvc();

            // Enable middleware to serve generated Swagger as a JSON endpoint.
            app.UseSwagger();

            // Enable middleware to serve swagger-ui (HTML, JS, CSS, etc.),
            // specifying the Swagger JSON endpoint.
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API V1");
            });
        }
    }

    // public class ClaimsTransformer : IClaimsTransformation
    // {
    //     public Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    //     {
    //         ClaimsIdentity claimsIdentity = (ClaimsIdentity)principal.Identity;

    //         // Flatten realm_access because Microsoft identity model doesn't support nested claims
    //         if (claimsIdentity.IsAuthenticated && claimsIdentity.HasClaim((claim) => claim.Type == "realm_access"))
    //         {
    //             var realmAccessClaim = claimsIdentity.FindFirst((claim) => claim.Type == "realm_access");
    //             var realmAccessAsDict = JsonConvert.DeserializeObject<Dictionary<string, string[]>>(realmAccessClaim.Value);
    //             if (realmAccessAsDict["roles"] != null)
    //             {
    //                 foreach (var role in realmAccessAsDict["roles"])
    //                 {
    //                     claimsIdentity.AddClaim(new Claim(ClaimTypes.Role, role));
    //                 }
    //             }
    //         }

    //         return Task.FromResult(principal);
    //     }
    // }
}

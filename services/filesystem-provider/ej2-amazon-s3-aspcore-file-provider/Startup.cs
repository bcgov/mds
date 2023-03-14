using System.Collections.Generic;
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
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.AspNetCore.Mvc.NewtonsoftJson;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Logging;
using System;
using System.Linq;

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
            services.AddMemoryCache();
            services.AddMvc(options => options.EnableEndpointRouting = false).SetCompatibilityVersion(CompatibilityVersion.Version_3_0);
            services.AddCors(options =>
            {
                options.AddPolicy("AllowAllOrigins", builder =>
                {
                    builder.AllowAnyOrigin()
                    .AllowAnyMethod()
                    .AllowAnyHeader();
                });
            });

            services.AddControllers().AddNewtonsoftJson();

            services.AddTransient<IClaimsTransformation, ClaimsTransformer>();

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(o =>
            {
                o.Authority = System.Environment.GetEnvironmentVariable("JWT_OIDC_AUTHORITY"); ;
                o.Audience = System.Environment.GetEnvironmentVariable("JWT_OIDC_AUDIENCE"); ;
            });

            services.AddAuthorization(options =>
            {
                options.AddPolicy("View", policy => { policy.RequireClaim(ClaimTypes.Role, new string[] { "core_view_all" }); });
            });

            services.AddSwaggerGen();

            services.Configure<GzipCompressionProviderOptions>(options => options.Level = System.IO.Compression.CompressionLevel.Optimal);
            services.AddResponseCompression();
            IdentityModelEventSource.ShowPII = true;
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

            app.UseAuthentication();
            app.UseCors("AllowAllOrigins");
            app.UseMvc();
            app.UseResponseCompression();

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

    public class ClaimsTransformer : IClaimsTransformation
    {
        private readonly ILogger<ClaimsTransformer> _logger;

        public ClaimsTransformer(ILogger<ClaimsTransformer> logger)
        {
            _logger = logger;
        }

        public Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
        {            
            ClaimsIdentity claimsIdentity = (ClaimsIdentity)principal.Identity;
            // Flatten client_roles because Microsoft identity model doesn't support nested claims
            if (claimsIdentity.IsAuthenticated && claimsIdentity.HasClaim((claim) => claim.Type == "client_roles"))
            {     
            foreach (var claim in principal.Claims.ToList())
                {
                    // Console.WriteLine("Claim Type: {0}, Value: {1}", claim.Type, claim.Value);
                    if (claim.Type == "client_roles")
                    {
                        claimsIdentity.AddClaim(new Claim(ClaimTypes.Role, claim.Value));
                    }
                }
            }

            return Task.FromResult(principal);
        }
    }
}
